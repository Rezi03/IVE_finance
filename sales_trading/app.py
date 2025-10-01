import streamlit as st
import yfinance as yf
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
import requests
from io import BytesIO
from fpdf import FPDF
import tempfile
import os
from datetime import datetime
import matplotlib.pyplot as plt

st.cache_data.clear()

st.set_page_config(
    page_title="Banking Market Intelligence Dashboard",
    layout="wide",
    initial_sidebar_state="expanded"
)

TICKERS = {
    "Goldman Sachs": "GS",
    "Morgan Stanley": "MS",
    "J.P. Morgan": "JPM",
    "Citi": "C",
    "Bank of America": "BAC",
    "Barclays (LSE)": "BARC.L"
}
BENCHMARK = "^GSPC" 

NEWS_API_KEY = st.secrets.get("NEWSAPI_KEY") if "NEWSAPI_KEY" in st.secrets else None

@st.cache_data(ttl=0, show_spinner=False)
def fetch_history(ticker, period="1y", interval="1d"):
    try:
        tk = yf.Ticker(ticker)
        df = tk.history(period=period, interval=interval)
        if df.empty:
            return pd.DataFrame()
        df = df.reset_index().rename(columns={"Date": "Date"})
        return df
    except Exception:
        return pd.DataFrame()

@st.cache_data(ttl=600, show_spinner=False)
def fetch_info(ticker):
    try:
        return yf.Ticker(ticker).info
    except Exception:
        return {}

def sma(series, window):
    return series.rolling(window).mean()

def compute_rsi(series, period=14):
    delta = series.diff()
    up = delta.clip(lower=0)
    down = -1 * delta.clip(upper=0)
    ma_up = up.rolling(period).mean()
    ma_down = down.rolling(period).mean()
    rs = ma_up / ma_down
    return 100 - (100 / (1 + rs))

def annualized_return(df):
    returns = df['Close'].pct_change().dropna()
    if returns.empty:
        return np.nan
    avg_daily = returns.mean()
    return (1 + avg_daily) ** 252 - 1

def cagr(df):
    if df.empty:
        return np.nan
    start = df['Close'].iloc[0]
    end = df['Close'].iloc[-1]
    days = (df['Date'].iloc[-1] - df['Date'].iloc[0]).days
    if days <= 0:
        return np.nan
    years = days / 365.25
    return (end / start) ** (1 / years) - 1

def max_drawdown(df):
    prices = df['Close']
    rolling_max = prices.cummax()
    drawdown = (prices - rolling_max) / rolling_max
    return drawdown.min()

def rolling_volatility(df, window=21):
    returns = df['Close'].pct_change().dropna()
    if returns.empty:
        return np.Series(dtype=float)
    return returns.rolling(window).std() * np.sqrt(252)

def sharpe_ratio(df, risk_free_rate=0.02):
    returns = df['Close'].pct_change().dropna()
    if returns.empty or returns.std() == 0:
        return np.nan
    excess_return = returns - (risk_free_rate / 252)
    return np.sqrt(252) * (excess_return.mean() / excess_return.std())

def sortino_ratio(df, risk_free_rate=0.02, period=252):
    returns = df['Close'].pct_change().dropna()
    if returns.empty:
        return np.nan
    excess = returns - (risk_free_rate / period)
    negative_returns = returns[returns < 0]
    if negative_returns.empty:
        return np.nan
    downside_std = negative_returns.std()
    if downside_std == 0:
        return np.nan
    return (np.sqrt(period) * excess.mean()) / downside_std

def beta_and_vol(df, benchmark_df):
    try:
        returns_stock = df['Close'].pct_change().dropna()
        returns_bench = benchmark_df['Close'].pct_change().dropna()
        joined = pd.concat([returns_stock, returns_bench], axis=1).dropna()
        if joined.shape[0] < 2:
            return np.nan, np.nan
        cov = joined.cov()
        beta = cov.iloc[0,1] / cov.iloc[1,1] if cov.iloc[1,1] != 0 else np.nan
        volatility = returns_stock.std() * np.sqrt(252)
        return beta, volatility
    except Exception:
        return np.nan, np.nan

def value_at_risk(df, confidence=0.95):
    returns = df['Close'].pct_change().dropna()
    if returns.empty:
        return np.nan
    return -np.percentile(returns, (1 - confidence) * 100)

def alpha_annualized(df, benchmark_df, risk_free_rate=0.02):
    try:
        r_stock = df['Close'].pct_change().dropna()
        r_bench = benchmark_df['Close'].pct_change().dropna()
        joined = pd.concat([r_stock, r_bench], axis=1).dropna()
        if joined.shape[0] < 2:
            return np.nan
        y = joined.iloc[:,0] - (risk_free_rate / 252)
        x = joined.iloc[:,1] - (risk_free_rate / 252)
        X = np.vstack([np.ones(len(x)), x]).T
        coef, residuals, rank, s = np.linalg.lstsq(X, y, rcond=None)
        intercept = coef[0]
        alpha_ann = intercept * 252
        return alpha_ann
    except Exception:
        return np.nan

def simulate_investment(df, initial_capital=1.0):
    returns = df['Close'].pct_change().fillna(0)
    equity = (1 + returns).cumprod()
    return equity

def generate_alerts(df):
    alerts = []
    try:
        if 'RSI' not in df.columns:
            df['RSI'] = compute_rsi(df['Close'])
        if df['RSI'].iloc[-1] >= 70:
            alerts.append("RSI ≥ 70 → Overbought possible")
        if df['RSI'].iloc[-1] <= 30:
            alerts.append("RSI ≤ 30 → Oversold possible")

        if 'SMA200' not in df.columns:
            df['SMA200'] = sma(df['Close'], 200)
        if df['Close'].iloc[-1] < df['SMA200'].iloc[-1]:
            alerts.append("Price below SMA200 → bearish long-term signal")

        vol = rolling_volatility(df, window=21)
        if not vol.empty and vol.iloc[-1] > 0.6: 
            alerts.append("High annualized volatility (>60%)")
    except Exception:
        pass
    return alerts

def get_news(query):
    if not NEWS_API_KEY:
        return []
    url = f"https://newsapi.org/v2/everything?q={query}&language=en&sortBy=publishedAt&pageSize=5&apiKey={NEWS_API_KEY}"
    try:
        res = requests.get(url, timeout=6).json()
        if res.get("status") != "ok":
            return []
        return res.get("articles", [])
    except Exception:
        return []

def create_placeholder_png(message="Chart not available"):
    buf = BytesIO()
    plt.figure(figsize=(8, 3))
    plt.text(0.5, 0.5, message, ha='center', va='center', fontsize=12)
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close()
    buf.seek(0)
    return buf.getvalue()

def render_chart_bytes(name, fig_obj=None, df=None, title="Chart"):
    if fig_obj is not None:
        try:
            import kaleido  
            try:
                img_bytes = fig_obj.to_image(format="png")
                if img_bytes:
                    return img_bytes
            except Exception:
                pass
        except Exception:
            pass

    if df is None or df.empty:
        return create_placeholder_png(f"{title} - no data")

    try:
        buf = BytesIO()
        x = df['Date']
        if name == "price":
            plt.figure(figsize=(10,4))
            plt.plot(x, df['Close'], label='Close', linewidth=1.4)
            if 'SMA50' not in df.columns:
                df['SMA50'] = sma(df['Close'], 50)
            if 'SMA200' not in df.columns:
                df['SMA200'] = sma(df['Close'], 200)
            if df['SMA50'].notna().any():
                plt.plot(x, df['SMA50'], label='SMA50', linestyle='--', linewidth=1)
            if df['SMA200'].notna().any():
                plt.plot(x, df['SMA200'], label='SMA200', linestyle=':', linewidth=1)
            plt.title(title)
            plt.legend()
            plt.grid(True)
            plt.tight_layout()
            plt.savefig(buf, format='png', bbox_inches='tight')
            plt.close()
            buf.seek(0)
            return buf.getvalue()

        if name == "rsi":
            if 'RSI' not in df.columns:
                df['RSI'] = compute_rsi(df['Close'])
            plt.figure(figsize=(10,3))
            plt.plot(x, df['RSI'], label='RSI (14)')
            plt.axhline(70, color='red', linestyle='--', linewidth=0.7)
            plt.axhline(30, color='green', linestyle='--', linewidth=0.7)
            plt.title(title)
            plt.ylim(0, 100)
            plt.grid(True)
            plt.tight_layout()
            plt.savefig(buf, format='png', bbox_inches='tight')
            plt.close()
            buf.seek(0)
            return buf.getvalue()

        if name == "vol":
            if 'RollingVol21' not in df.columns:
                df['RollingVol21'] = rolling_volatility(df, window=21)
            plt.figure(figsize=(10,3))
            plt.plot(x, df['RollingVol21'], label='21-day rolling vol')
            plt.title(title)
            plt.grid(True)
            plt.tight_layout()
            plt.savefig(buf, format='png', bbox_inches='tight')
            plt.close()
            buf.seek(0)
            return buf.getvalue()

        if name == "equity":
            eq = simulate_investment(df)
            plt.figure(figsize=(10,3))
            plt.plot(x, eq, label='Equity Curve')
            plt.title(title)
            plt.grid(True)
            plt.tight_layout()
            plt.savefig(buf, format='png', bbox_inches='tight')
            plt.close()
            buf.seek(0)
            return buf.getvalue()

        if name == "hist":
            returns = df['Close'].pct_change().dropna()
            plt.figure(figsize=(8,3))
            plt.hist(returns, bins=50)
            plt.title(title)
            plt.grid(True)
            plt.tight_layout()
            plt.savefig(buf, format='png', bbox_inches='tight')
            plt.close()
            buf.seek(0)
            return buf.getvalue()

        return create_placeholder_png(f"{name} - chart type not handled")
    except Exception as e:
        return create_placeholder_png(f"Render error: {str(e)[:80]}")

def generate_analysis(df, metrics, rf_rate=0.02):
    """
    df : DataFrame (with Close, RSI, SMA50, SMA200, RollingVol21 fields if available)
    metrics : dict with keys like 'annual_ret','vol','sharpe','sortino','beta','alpha','var95','cagr','max_dd'
    Returns : (analysis_text, analysis_bullets)
    """
    def fmt_ratio(x):
        try:
            return f"{x:.2f}"
        except Exception:
            return "N/A"
    def fmt_pct(x):
        try:
            return f"{x*100:.2f}%"
        except Exception:
            return "N/A"

    annual_ret = metrics.get("annual_ret", np.nan)
    vol = metrics.get("vol", np.nan)
    sharpe = metrics.get("sharpe", np.nan)
    sortino = metrics.get("sortino", np.nan)
    beta = metrics.get("beta", np.nan)
    alpha = metrics.get("alpha", np.nan)
    var95 = metrics.get("var95", np.nan)
    cagr_val = metrics.get("cagr", np.nan)
    max_dd = metrics.get("max_dd", np.nan)

    bullets = []
    score = 0

    try:
        if 'SMA50' in df.columns and 'SMA200' in df.columns:
            if df['SMA50'].iloc[-1] > df['SMA200'].iloc[-1]:
                bullets.append("SMA50 > SMA200 → medium-term bullish trend.")
                score += 1
            else:
                bullets.append("SMA50 < SMA200 → medium-term bearish trend.")
                score -= 1
    except Exception:
        pass

    try:
        if 'RSI' in df.columns:
            rsi_now = df['RSI'].iloc[-1]
            if rsi_now >= 70:
                bullets.append(f"RSI ({rsi_now:.1f}) high → potential overbought condition.")
                score -= 1
            elif rsi_now <= 30:
                bullets.append(f"RSI ({rsi_now:.1f}) low → potential oversold rebound.")
                score += 1
            else:
                bullets.append(f"RSI ({rsi_now:.1f}) neutral.")
    except Exception:
        pass

    try:
        if not np.isnan(vol):
            if vol > 0.6:
                bullets.append(f"High annualized volatility ({vol*100:.1f}%) → elevated risk.")
                score -= 1
            elif vol < 0.15:
                bullets.append(f"Low annualized volatility ({vol*100:.1f}%) → calm market.")
                score += 1
            else:
                bullets.append(f"Moderate annualized volatility ({vol*100:.1f}%).")
    except Exception:
        pass

    try:
        if not np.isnan(sharpe):
            if sharpe > 1:
                bullets.append(f"Sharpe ratio strong ({fmt_ratio(sharpe)}) → good risk-adjusted returns.")
                score += 1
            elif sharpe < 0.5:
                bullets.append(f"Sharpe ratio weak ({fmt_ratio(sharpe)}) → low return per unit risk.")
                score -= 1
            else:
                bullets.append(f"Sharpe ratio moderate ({fmt_ratio(sharpe)}).")
    except Exception:
        pass

    try:
        if not np.isnan(sortino):
            bullets.append(f"Sortino ratio: {fmt_ratio(sortino)} (focuses on downside risk).")
    except Exception:
        pass

    try:
        if not np.isnan(var95):
            bullets.append(f"VaR 95%: {fmt_pct(var95)}.")
        if not np.isnan(max_dd):
            bullets.append(f"Max Drawdown: {fmt_pct(max_dd)} for the analyzed period.")
            if max_dd < -0.3:
                bullets.append("Drawdown > 30% historically → caution advised.")
                score -= 1
    except Exception:
        pass

    try:
        if not np.isnan(beta):
            bullets.append(f"Beta vs benchmark: {fmt_ratio(beta)} (market sensitivity).")
        if not np.isnan(alpha):
            bullets.append(f"Alpha (annualized): {fmt_pct(alpha)} (risk-adjusted outperformance).")
            if alpha > 0.02:
                bullets.append("Positive alpha >2% annualized → potential value-add.")
                score += 1
    except Exception:
        pass

    try:
        if not np.isnan(cagr_val):
            bullets.append(f"CAGR: {fmt_pct(cagr_val)}.")
    except Exception:
        pass

    recs = []
    if score >= 2:
        recs.append("Overall signal: Positive — consider cautious allocation.")
    elif score <= -2:
        recs.append("Overall signal: Negative — consider reducing exposure or hedging.")
    else:
        recs.append("Overall signal: Neutral — monitor indicators for confirmation.")

    parts = []
    parts.append(f"Over the selected period the annualized return is {fmt_pct(annual_ret)} and annualized volatility is {fmt_pct(vol)}.")
    if not np.isnan(sharpe):
        parts.append(f"Sharpe: {fmt_ratio(sharpe)}.")
    if not np.isnan(beta):
        parts.append(f"Beta vs benchmark: {fmt_ratio(beta)}.")
    if not np.isnan(alpha):
        parts.append(f"Alpha (annualized): {fmt_pct(alpha)}.")
    parts.append(recs[0])

    analysis_text = " ".join(parts)
    analysis_bullets = bullets + [""] + recs
    return analysis_text, analysis_bullets

st.sidebar.title("Controls")
tab = st.sidebar.radio("Tabs", ["Dashboard", "News"])
st.sidebar.markdown("---")
st.sidebar.caption("Built with Streamlit, yfinance, Plotly")

if tab == "Dashboard":
    st.markdown("<h1 style='font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto;'>Banking Market Intelligence Dashboard</h1>", unsafe_allow_html=True)
    mode = st.sidebar.radio("Mode", ["Single Bank", "Comparison"])
    period = st.sidebar.selectbox("Period", ["1mo", "3mo", "6mo", "1y", "5y"], index=3)
    interval = st.sidebar.selectbox("Interval", ["1d", "1wk"], index=0)
    show_tech = st.sidebar.checkbox("Show technical indicators", value=True)
    rf_rate = st.sidebar.number_input("Risk-free rate (annual, e.g. 0.02)", value=0.02, step=0.005, format="%.4f")

    if mode == "Single Bank":
        bank = st.sidebar.selectbox("Select bank", list(TICKERS.keys()))
        ticker = TICKERS[bank]
        df = fetch_history(ticker, period, interval)
        info = fetch_info(ticker)

        if df.empty or 'Close' not in df.columns or df['Close'].isnull().all():
            st.error("No market data available for this bank and period.")
        else:
            benchmark_df = fetch_history(BENCHMARK, period, interval)

            if show_tech:
                df['SMA50'] = sma(df['Close'], 50)
                df['SMA200'] = sma(df['Close'], 200)
                df['RSI'] = compute_rsi(df['Close'])
                df['RollingVol21'] = rolling_volatility(df, window=21)

            last_price = df['Close'].iloc[-1]
            market_cap = info.get('marketCap', None)
            cagr_val = cagr(df)
            max_dd = max_drawdown(df)
            sharpe = sharpe_ratio(df, risk_free_rate=rf_rate)
            sortino = sortino_ratio(df, risk_free_rate=rf_rate)
            var95 = value_at_risk(df, confidence=0.95)
            annual_ret = annualized_return(df)
            beta, vol = beta_and_vol(df, benchmark_df)
            alpha_ann = alpha_annualized(df, benchmark_df, risk_free_rate=rf_rate)
            treynor = (annual_ret - rf_rate) / beta if (not np.isnan(annual_ret) and not np.isnan(beta) and beta != 0) else np.nan

            col1, col2, col3, col4, col5 = st.columns(5)
            col1.metric("Last Price (USD)", f"{last_price:.2f}")
            col2.metric("Market Cap", f"{market_cap:,}" if market_cap else "N/A")
            col3.metric("CAGR (annual)", f"{cagr_val*100:.2f}%" if not np.isnan(cagr_val) else "N/A")
            col4.metric("Max Drawdown", f"{max_dd*100:.2f}%" if not np.isnan(max_dd) else "N/A")
            col5.metric("Sharpe Ratio", f"{sharpe:.2f}" if not np.isnan(sharpe) else "N/A")

            col6, col7, col8, col9, col10 = st.columns(5)
            col6.metric("Sortino Ratio", f"{sortino:.2f}" if not np.isnan(sortino) else "N/A")
            col7.metric("Annual Volatility", f"{vol*100:.2f}%" if not np.isnan(vol) else "N/A")
            col8.metric("Beta vs S&P500", f"{beta:.2f}" if not np.isnan(beta) else "N/A")
            col9.metric("Alpha (ann.)", f"{alpha_ann*100:.2f}%" if not np.isnan(alpha_ann) else "N/A")
            col10.metric("Treynor Ratio", f"{treynor:.2f}" if not np.isnan(treynor) else "N/A")

            fig_price = go.Figure(data=[go.Candlestick(
                x=df['Date'], open=df['Open'], high=df['High'],
                low=df['Low'], close=df['Close'], name='Price'
            )])
            fig_price.update_layout(title=f"{bank} Price Evolution", xaxis_rangeslider_visible=False, template="plotly_white", height=480)
            st.plotly_chart(fig_price, use_container_width=True)

            left, right = st.columns([2,1])
            with left:
                if show_tech:
                    fig_sma = go.Figure()
                    fig_sma.add_trace(go.Scatter(x=df['Date'], y=df['Close'], name='Close', mode='lines'))
                    fig_sma.add_trace(go.Scatter(x=df['Date'], y=df['SMA50'], name='SMA50', mode='lines'))
                    fig_sma.add_trace(go.Scatter(x=df['Date'], y=df['SMA200'], name='SMA200', mode='lines'))
                    fig_sma.update_layout(title="Price with SMAs", template="plotly_white", height=350)
                    st.plotly_chart(fig_sma, use_container_width=True)

                    fig_rsi = px.line(df, x='Date', y='RSI', title="RSI (14)", template="plotly_white", height=220)
                    fig_rsi.update_yaxes(range=[0,100])
                    st.plotly_chart(fig_rsi, use_container_width=True)

            with right:
                fig_hist = px.histogram(df.assign(Returns=df['Close'].pct_change()), x='Returns', nbins=50, title="Daily Returns Distribution", template="plotly_white", height=300)
                st.plotly_chart(fig_hist, use_container_width=True)

                equity = simulate_investment(df)
                fig_eq = go.Figure()
                fig_eq.add_trace(go.Scatter(x=df['Date'], y=equity, name='Equity Curve'))
                fig_eq.update_layout(title="Equity Curve (1 unit invested)", template="plotly_white", height=300)
                st.plotly_chart(fig_eq, use_container_width=True)

                alerts = generate_alerts(df)
                if alerts:
                    st.warning(" | ".join(alerts))

            if 'RollingVol21' not in df.columns:
                df['RollingVol21'] = rolling_volatility(df, window=21)
            fig_roll = px.line(df, x='Date', y='RollingVol21', title="21-day Rolling Volatility (annualized)", template="plotly_white", height=220)
            st.plotly_chart(fig_roll, use_container_width=True)

            metrics_for_analysis = {
                "annual_ret": annual_ret,
                "vol": vol,
                "sharpe": sharpe,
                "sortino": sortino,
                "beta": beta,
                "alpha": alpha_ann,
                "var95": var95,
                "cagr": cagr_val,
                "max_dd": max_dd
            }

            analysis_text, analysis_bullets = generate_analysis(df, metrics_for_analysis, rf_rate=rf_rate)

            st.markdown("**Automated numerical summary:**")
            summary_lines = []
            if not np.isnan(annual_ret):
                summary_lines.append(f"Annualized return: {annual_ret*100:.2f}%")
            if not np.isnan(vol):
                summary_lines.append(f"Annualized volatility: {vol*100:.2f}%")
            if not np.isnan(sharpe):
                summary_lines.append(f"Sharpe: {sharpe:.2f}")
            if not np.isnan(sortino):
                summary_lines.append(f"Sortino: {sortino:.2f}")
            if not np.isnan(beta):
                summary_lines.append(f"Beta vs S&P500: {beta:.2f}")
            if not np.isnan(alpha_ann):
                summary_lines.append(f"Alpha (annualized): {alpha_ann*100:.2f}%")
            if not np.isnan(var95):
                summary_lines.append(f"VaR 95%: {var95*100:.2f}%")
            auto_text = " | ".join(summary_lines)
            st.code(auto_text, language="text")

            st.markdown("**Automated analysis (rule-based):**")
            for b in analysis_bullets:
                if b:
                    st.write("- " + b)

            st.markdown("### Generate a structured PDF report")
            generate_col1, generate_col2 = st.columns([3,1])
            with generate_col1:
                st.info("Report includes: cover, key metrics, automated summary, and embedded charts.")
            with generate_col2:
                if st.button("Generate PDF Report", key=f"gen_pdf_{ticker}", help="Create and download a structured PDF report"):
                    figs_to_save = [
                        ("price", fig_price, "Price"),
                        ("sma", fig_sma if 'fig_sma' in locals() else None, "Price with SMAs"),
                        ("rsi", fig_rsi if 'fig_rsi' in locals() else None, "RSI (14)"),
                        ("vol", fig_roll, "Rolling Volatility"),
                        ("equity", fig_eq, "Equity Curve"),
                        ("hist", fig_hist, "Daily Returns Distribution")
                    ]
                    tmp_files = []
                    try:
                        for name, fig, title in figs_to_save:
                            img_bytes = None
                            if fig is not None:
                                try:
                                    import kaleido 
                                    img_bytes = fig.to_image(format="png")
                                except Exception:
                                    img_bytes = render_chart_bytes(name, fig_obj=None, df=df, title=title)
                            else:
                                img_bytes = render_chart_bytes(name, fig_obj=None, df=df, title=title)

                            if not img_bytes:
                                img_bytes = create_placeholder_png(f"{title} - no image")

                            tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
                            tmp.write(img_bytes)
                            tmp.flush()
                            tmp_files.append(tmp.name)
                            tmp.close()

                        pdf = FPDF(unit="pt", format="A4")
                        FONT_PATH = os.path.join(os.path.dirname(__file__), "fonts", "DejaVuSans.ttf")
                        try:
                            pdf.add_font("DejaVu", "", FONT_PATH, uni=True)
                        except Exception:
                            pass
                        pdf.set_auto_page_break(auto=True, margin=36)

                        pdf.add_page()
                        try:
                            pdf.set_font("DejaVu", size=18)
                        except Exception:
                            pdf.set_font("Helvetica", size=18)
                        pdf.cell(0, 36, f"{bank} - Financial Report", ln=True, align="C")
                        try:
                            pdf.set_font("DejaVu", size=11)
                        except Exception:
                            pdf.set_font("Helvetica", size=11)
                        pdf.ln(8)
                        pdf.multi_cell(0, 12, f"Report generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", align="C")
                        pdf.multi_cell(0, 12, f"Period: {period} | Interval: {interval}", align="C")

                        pdf.add_page()
                        try:
                            pdf.set_font("DejaVu", size=14)
                        except Exception:
                            pdf.set_font("Helvetica", size=14)
                        pdf.cell(0, 16, "Key Metrics", ln=True)
                        try:
                            pdf.set_font("DejaVu", size=10)
                        except Exception:
                            pdf.set_font("Helvetica", size=10)
                        pdf.ln(6)
                        market_cap_str = f"{market_cap:,}" if market_cap else "N/A"
                        pdf.cell(0, 12, f"Last Price: {last_price:.2f} USD", ln=True)
                        pdf.cell(0, 12, f"Market Cap: {market_cap_str}", ln=True)
                        pdf.cell(0, 12, f"CAGR: {cagr_val*100:.2f}%" if not np.isnan(cagr_val) else "CAGR: N/A", ln=True)
                        pdf.cell(0, 12, f"Annualized Return: {annual_ret*100:.2f}%" if not np.isnan(annual_ret) else "Annualized Return: N/A", ln=True)
                        pdf.cell(0, 12, f"Annual Volatility: {vol*100:.2f}%" if not np.isnan(vol) else "Annual Volatility: N/A", ln=True)
                        pdf.cell(0, 12, f"Sharpe Ratio: {sharpe:.2f}" if not np.isnan(sharpe) else "Sharpe Ratio: N/A", ln=True)
                        pdf.cell(0, 12, f"Sortino Ratio: {sortino:.2f}" if not np.isnan(sortino) else "Sortino Ratio: N/A", ln=True)
                        pdf.cell(0, 12, f"Max Drawdown: {max_dd*100:.2f}%" if not np.isnan(max_dd) else "Max Drawdown: N/A", ln=True)
                        pdf.cell(0, 12, f"Beta vs S&P500: {beta:.2f}" if not np.isnan(beta) else "Beta vs S&P500: N/A", ln=True)
                        pdf.cell(0, 12, f"Alpha (ann.): {alpha_ann*100:.2f}%" if not np.isnan(alpha_ann) else "Alpha (ann.): N/A", ln=True)
                        pdf.cell(0, 12, f"VaR 95%: {var95*100:.2f}%" if not np.isnan(var95) else "VaR 95%: N/A", ln=True)

                        pdf.ln(8)
                        try:
                            pdf.set_font("DejaVu", size=12)
                        except Exception:
                            pdf.set_font("Helvetica", size=12)
                        pdf.cell(0, 12, "Automated numerical summary", ln=True)
                        try:
                            pdf.set_font("DejaVu", size=10)
                        except Exception:
                            pdf.set_font("Helvetica", size=10)
                        pdf.multi_cell(0, 10, auto_text)

                        pdf.ln(6)
                        try:
                            pdf.set_font("DejaVu", size=12)
                        except Exception:
                            pdf.set_font("Helvetica", size=12)
                        pdf.cell(0, 12, "Automated analysis", ln=True)
                        try:
                            pdf.set_font("DejaVu", size=10)
                        except Exception:
                            pdf.set_font("Helvetica", size=10)
                        for b in analysis_bullets:
                            if b:
                                pdf.multi_cell(0, 10, "- " + b)

                        for path in tmp_files:
                            pdf.add_page()
                            try:
                                pdf.set_font("DejaVu", size=12)
                            except Exception:
                                pdf.set_font("Helvetica", size=12)
                            pdf.cell(0, 12, f"Chart: {os.path.basename(path)}", ln=True)
                            page_width = pdf.w - 72
                            try:
                                pdf.image(path, x=36, y=60, w=page_width)
                            except Exception:
                                try:
                                    pdf.set_font("DejaVu", size=10)
                                except Exception:
                                    pdf.set_font("Helvetica", size=10)
                                pdf.cell(0, 12, f"Chart {os.path.basename(path)} could not be embedded.", ln=True)
                        try:
                            pdf_bytes = pdf.output(dest="S").encode("latin1", "ignore")
                        except Exception:
                            pdf_bytes = pdf.output(dest="S").encode("utf-8", "ignore")

                        st.download_button(
                            label="Download PDF",
                            data=pdf_bytes,
                            file_name=f"{ticker}_financial_report.pdf",
                            mime="application/pdf",
                            key=f"download_pdf_{ticker}"
                        )

                    finally:
                        for p in tmp_files:
                            try:
                                os.remove(p)
                            except Exception:
                                pass

    else: 
        banks = st.sidebar.multiselect("Select banks", list(TICKERS.keys()), default=["Goldman Sachs", "Morgan Stanley"])
        if len(banks) < 2:
            st.warning("Select at least two banks for comparison.")
        else:
            data = {}
            for b in banks:
                data[b] = fetch_history(TICKERS[b], period, interval)

            fig = go.Figure()
            for bank, dfb in data.items():
                if not dfb.empty and 'Close' in dfb.columns:
                    dfb_sorted = dfb.sort_values('Date')
                    cum = (1 + dfb_sorted['Close'].pct_change().fillna(0)).cumprod()
                    fig.add_trace(go.Scatter(x=dfb_sorted['Date'], y=cum, mode='lines', name=bank))
            fig.update_layout(title="Normalized Cumulative Returns", template="plotly_white")
            st.plotly_chart(fig, use_container_width=True)

            metrics = []
            for b in banks:
                dfb = data[b]
                if dfb.empty:
                    metrics.append({"Bank": b, "CAGR": "N/A", "Sharpe": "N/A", "Volatility": "N/A"})
                    continue
                benchmark_df = fetch_history(BENCHMARK, period, interval)
                beta_b, vol_b = beta_and_vol(dfb, benchmark_df)
                metrics.append({
                    "Bank": b,
                    "CAGR": f"{cagr(dfb)*100:.2f}%",
                    "Sharpe": f"{sharpe_ratio(dfb, risk_free_rate=rf_rate):.2f}",
                    "Volatility": f"{(dfb['Close'].pct_change().std()*np.sqrt(252))*100:.2f}%"
                })
            st.dataframe(pd.DataFrame(metrics))

            returns_df = pd.DataFrame()
            for b in banks:
                dfb = data[b].set_index('Date').sort_index()
                if 'Close' in dfb.columns:
                    returns_df[b] = dfb['Close'].pct_change()
            if returns_df.dropna(how='all').shape[1] > 1:
                corr = returns_df.corr()
                fig_corr = px.imshow(corr, text_auto=True, title="Return Correlation Matrix", template="plotly_white")
                st.plotly_chart(fig_corr, use_container_width=True)

elif tab == "News":
    st.markdown("<h1>Latest Banking News</h1>", unsafe_allow_html=True)
    bank_for_news = st.selectbox("Select bank for news", list(TICKERS.keys()))
    if not NEWS_API_KEY:
        st.error("NEWSAPI_KEY missing or invalid. Please add a valid key to Streamlit secrets to fetch news.")
        articles = []
    else:
        articles = get_news(bank_for_news)
        if not articles:
            st.info("No news available for this bank at the moment.")
    for art in articles:
        st.markdown(f"**[{art.get('title')}]({art.get('url')})** — *{art.get('source', {}).get('name', '')}*")
        st.write(art.get("description", ""))
        st.write("---")
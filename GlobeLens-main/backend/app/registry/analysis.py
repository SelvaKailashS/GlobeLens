from typing import Dict, List, Optional
from backend.app.models.analysis import AnalysisMethod

ANALYSIS_REGISTRY: Dict[str, AnalysisMethod] = {
    "mann_kendall": AnalysisMethod(
        method_id="mann_kendall",
        name="Mann-Kendall Trend Test",
        category="trend_detection",
        description="Non-parametric test assessing whether a monotonic upward or downward trend exists in a time series without assuming normal distribution.",
        mathematical_basis="Calculates the sign of all pairwise differences (x_j - x_k for j > k). The S statistic is normalized by the variance of S (accounting for ties) to derive a standard normal Z score and two-tailed p-value.",
        minimum_observations=10,
        assumptions=[
            "Observations are independent and identically distributed over time (no serial autocorrelation)",
            "Data does not need to be normally distributed",
            "Monotonic trend assumption: changes are unidirectional over the evaluated interval",
            "Missing values must be accounted for or imputed prior to test evaluation",
        ],
        outputs_provided=[
            "trend ('increasing', 'decreasing', 'no trend')",
            "p_value (two-tailed asymptotic significance)",
            "z_score (standardized test statistic)",
            "tau (Kendall's tau rank correlation coefficient)",
            "s_statistic (raw score sum of pairwise differences)",
            "var_s (variance of S statistic)",
        ],
        suitable_variables=[
            "Precipitation anomalies",
            "Surface temperature",
            "Vegetation indices (NDVI/EVI)",
            "Trace gas column density",
            "Evapotranspiration",
        ],
        library_source="pymannkendall.original_test",
    ),
    "sen_slope": AnalysisMethod(
        method_id="sen_slope",
        name="Sen's Non-Parametric Slope Estimator",
        category="trend_magnitude",
        description="Robust linear rate-of-change estimator resistant to gross outliers and non-normal residuals.",
        mathematical_basis="Calculates all pairwise slopes Q_k = (x_j - x_i) / (t_j - t_i) for 1 <= i < j <= N. The Sen's slope is the median of all N*(N-1)/2 slope pairs. Non-parametric rank confidence intervals are computed using the standard normal critical value.",
        minimum_observations=10,
        assumptions=[
            "Linear trend structure across the sampled interval",
            "Continuously distributed data",
            "Measurement times t_i are strictly ordered",
            "Tolerant of up to ~29% outlier contamination",
        ],
        outputs_provided=[
            "slope (median change per unit time, matching original unit)",
            "intercept (estimated constant offset)",
            "confidence_interval_low (e.g. 95% rank lower bound)",
            "confidence_interval_high (e.g. 95% rank upper bound)",
        ],
        suitable_variables=[
            "Precipitation rate (mm/day/year)",
            "Land Surface Temperature (K/decade)",
            "NDVI trend (unitless/year)",
            "Ozone column (Dobson Units/decade)",
        ],
        library_source="scipy.stats.mstats.theilslopes / pymannkendall.sens_slope",
    ),
    "seasonal_mann_kendall": AnalysisMethod(
        method_id="seasonal_mann_kendall",
        name="Seasonal Mann-Kendall Test (Hirsch-Slack)",
        category="seasonal_trend_detection",
        description="Extension of the Mann-Kendall test that accounts for seasonality by performing independent trend tests within each month/season and aggregating test statistics.",
        mathematical_basis="Computes Mann-Kendall S_g for each individual season g in 1..m. Aggregates total S = sum(S_g) and variance Var(S) = sum(Var(S_g)). Evaluates standard normal Z statistic from pooled results.",
        minimum_observations=24,
        assumptions=[
            "Monthly or cyclical seasonal data structure",
            "No significant cross-correlation between different seasons",
            "Sufficient seasonal cycles (>= 2 full annual cycles)",
        ],
        outputs_provided=[
            "trend ('increasing', 'decreasing', 'no trend')",
            "p_value (seasonally adjusted two-tailed significance)",
            "z_score (seasonal standard score)",
            "seasonal_slopes (median slopes for individual seasons)",
            "pooled_sen_slope (overall seasonal Sen's slope)",
        ],
        suitable_variables=[
            "Monthly MODIS NDVI",
            "Monthly GPM IMERG Precipitation",
            "Monthly AIRS Surface Air Temperature",
            "Monthly GLDAS Soil Moisture",
        ],
        library_source="pymannkendall.seasonal_test",
    ),
    "pettitt_test": AnalysisMethod(
        method_id="pettitt_test",
        name="Pettitt Change-Point Detection Test",
        category="change_point",
        description="Non-parametric rank test for identifying an abrupt single shift in the mean of a continuous time series.",
        mathematical_basis="Computes U_{t,T} = sum_{i=1}^t sum_{j=t+1}^T sgn(x_i - x_j). The change point occurs at the timestamp where |U_{t,T}| is maximized. Approximate significance p is derived from K = max|U_{t,T}|.",
        minimum_observations=15,
        assumptions=[
            "Continuous time series",
            "Single step change or shift in central tendency",
            "Data before and after change point follow distinct distribution means",
        ],
        outputs_provided=[
            "change_point_index (location of maximum shift in index coordinates)",
            "change_point_timestamp (estimated date/time of structural shift)",
            "p_value (significance of detected break point)",
            "statistic_k (Pettitt U statistic maximum)",
        ],
        suitable_variables=[
            "Annual precipitation totals",
            "Streamflow / runoff volume",
            "Extreme temperature frequency",
            "Aerosol optical depth transitions",
        ],
        library_source="pyhomogeneity.pettitt_test / custom rank shift implementation",
    ),
    "ols_linear_regression": AnalysisMethod(
        method_id="ols_linear_regression",
        name="Ordinary Least Squares (OLS) Linear Regression",
        category="parametric_trend",
        description="Classical parametric linear trend regression providing slope, intercept, standard error, and Pearson correlation coefficient (r²).",
        mathematical_basis="Minimizes the sum of squared vertical residuals between observed points and fitted linear line y = mx + c. Significance p-value evaluated via Student's t-distribution for slope m.",
        minimum_observations=5,
        assumptions=[
            "Linear relationship between time and environmental variable",
            "Residuals are normally distributed with zero mean",
            "Homoscedasticity (constant variance of residuals over time)",
            "No severe multi-collinearity or non-linear oscillations",
        ],
        outputs_provided=[
            "slope (rate of change per time unit)",
            "intercept (y-intercept)",
            "r_squared (coefficient of determination)",
            "p_value (t-test significance for slope != 0)",
            "standard_error (standard error of estimated slope)",
        ],
        suitable_variables=[
            "Detrended temperature anomalies",
            "Tropospheric ozone column density",
            "Reanalysis 2-meter air temperature",
        ],
        library_source="scipy.stats.linregress",
    ),
    "standardized_anomaly": AnalysisMethod(
        method_id="standardized_anomaly",
        name="Standardized Climatological Anomaly (Z-Score)",
        category="anomaly_computation",
        description="Calculates normalized departures from a multi-year climatological baseline mean for each month or day of year.",
        mathematical_basis="Z(t) = (x(t) - mu_m) / sigma_m, where mu_m and sigma_m are the mean and standard deviation of month m computed over a multi-decadal reference baseline period.",
        minimum_observations=36,
        assumptions=[
            "Sufficient baseline climatology period (ideally >= 20 to 30 years)",
            "Representative monthly or daily sampling",
            "Climatological distribution approximately unimodal",
        ],
        outputs_provided=[
            "anomaly_values (dimensionless z-score series)",
            "baseline_mean (monthly reference climatology)",
            "baseline_std (monthly reference dispersion)",
            "extreme_threshold_exceedances (timestamps where |Z| > 2.0)",
        ],
        suitable_variables=[
            "Precipitation (SPI proxy)",
            "Land Surface Temperature anomalies",
            "Soil Moisture index",
            "Vegetation Condition Index (VCI)",
        ],
        library_source="scipy.stats.zscore / custom monthly climatology pipeline",
    ),
}


def list_analysis_methods() -> List[AnalysisMethod]:
    """Return all documented analytical and statistical methods."""
    return list(ANALYSIS_REGISTRY.values())


def get_analysis_method(method_id: str) -> Optional[AnalysisMethod]:
    """Retrieve metadata for a specific analysis method by technical identifier."""
    return ANALYSIS_REGISTRY.get(method_id.lower())

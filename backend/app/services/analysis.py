from datetime import date, datetime
import math
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field
import pymannkendall as pmk
from scipy import stats

from backend.app.models.common import ObservationPoint


class LinearRegressionResult(BaseModel):
    """Ordinary Least Squares linear regression diagnostics."""
    slope: float = Field(..., description="Rate of change per year")
    intercept: float = Field(..., description="Estimated regression intercept")
    r_squared: float = Field(..., description="Coefficient of determination (0 to 1)")
    p_value: float = Field(..., description="Two-tailed Student's t-test significance")
    standard_error: float = Field(..., description="Standard error of the estimated slope")
    confidence_interval_95: Tuple[float, float] = Field(..., description="Parametric 95% CI (slope_low, slope_high)")
    is_significant: bool = Field(..., description="True if p_value < significance_threshold")


class MannKendallResult(BaseModel):
    """Non-parametric Mann-Kendall monotonic trend test."""
    trend: str = Field(..., description="'increasing', 'decreasing', or 'no trend'")
    p_value: float = Field(..., description="Asymptotic two-tailed p-value")
    z_score: float = Field(..., description="Standard normal test statistic")
    tau: float = Field(..., description="Kendall's tau rank correlation coefficient (-1 to +1)")
    s_statistic: float = Field(..., description="Sum of signs of pairwise differences")
    var_s: float = Field(..., description="Variance of S statistic accounting for ties")
    is_significant: bool = Field(..., description="True if p_value < significance_threshold")


class SensSlopeResult(BaseModel):
    """Sen's robust non-parametric median slope estimator."""
    slope: float = Field(..., description="Median pairwise rate of change per year")
    intercept: float = Field(..., description="Estimated non-parametric constant offset")
    confidence_interval_95: Tuple[float, float] = Field(..., description="Hollander-Wolfe rank-based 95% CI")
    rate_per_decade: float = Field(..., description="Rate scaled to change per decade")
    rate_unit: str = Field(..., description="Physical unit rate string (e.g. 'mm/hr/year')")


class SeasonalMannKendallResult(BaseModel):
    """Hirsch-Slack seasonal Mann-Kendall test accounting for annual cycles."""
    trend: str = Field(..., description="'increasing', 'decreasing', or 'no trend'")
    p_value: float = Field(..., description="Seasonally adjusted p-value")
    z_score: float = Field(..., description="Seasonal standard normal score")
    tau: float = Field(..., description="Seasonal Kendall's tau")
    seasonal_slopes: Dict[str, float] = Field(default_factory=dict, description="Median slope per calendar month/season")
    is_significant: bool = Field(..., description="True if p_value < significance_threshold")


class PettittTestResult(BaseModel):
    """Pettitt's non-parametric single change-point test for abrupt structural shifts."""
    has_change_point: bool = Field(..., description="True if change point is statistically significant")
    change_point_index: Optional[int] = Field(None, description="Index of detected break")
    change_point_date: Optional[str] = Field(None, description="Estimated timestamp of structural shift")
    statistic_k: float = Field(..., description="Maximum absolute Pettitt U statistic")
    p_value: float = Field(..., description="Approximate significance of change point")
    pre_shift_mean: Optional[float] = Field(None, description="Mean of observations prior to break")
    post_shift_mean: Optional[float] = Field(None, description="Mean of observations following break")


class AnomalyPoint(BaseModel):
    """Standardized anomaly departure from climatological baseline."""
    timestamp: str
    observed_value: float
    climatological_mean: float
    anomaly_value: float
    z_score: float
    is_extreme: bool = Field(default=False, description="True if |Z| >= 2.0")


class StandardizedAnomalyResult(BaseModel):
    """Climatological monthly baseline and standardized departure series."""
    monthly_climatology_mean: Dict[str, float] = Field(..., description="Multi-year baseline mean for each month (1..12)")
    monthly_climatology_std: Dict[str, float] = Field(..., description="Multi-year baseline std for each month (1..12)")
    anomalies: List[AnomalyPoint] = Field(..., description="Normalized departure series")
    extreme_positive_count: int = Field(default=0, description="Observations with Z >= +2.0")
    extreme_negative_count: int = Field(default=0, description="Observations with Z <= -2.0")


class ComprehensiveAnalysisResult(BaseModel):
    """Unified scientific trend investigation package."""
    variable_id: str
    original_units: str
    observation_count: int
    valid_observation_count: int
    data_coverage_fraction: float
    time_range_start: str
    time_range_end: str
    significance_threshold: float = 0.05
    overall_trend_direction: str
    is_statistically_significant: bool

    linear_regression: Optional[LinearRegressionResult] = None
    mann_kendall: Optional[MannKendallResult] = None
    sens_slope: Optional[SensSlopeResult] = None
    seasonal_mann_kendall: Optional[SeasonalMannKendallResult] = None
    pettitt_change_point: Optional[PettittTestResult] = None
    standardized_anomalies: Optional[StandardizedAnomalyResult] = None

    plain_language_interpretation: str = Field(..., description="Grounded, plain-language explanation")
    scientific_limitations: List[str] = Field(..., description="Caveats, autocorrelation notes, and sampling limitations")


class ScientificTrendAnalyzer:
    """
    Authoritative scientific engine for trend detection, non-parametric tests,
    change-point identification, and climatological anomaly decomposition.
    """

    @staticmethod
    def _clean_series(points: List[ObservationPoint]) -> Tuple[pd.Series, pd.DatetimeIndex]:
        """
        Extract valid, non-null observations, sort chronologically, and deduplicate timestamps.
        """
        valid_points = [p for p in points if p.is_valid and p.value is not None and not np.isnan(p.value)]
        if not valid_points:
            raise ValueError("No valid observations provided for statistical trend analysis.")

        data_dict: Dict[datetime, float] = {}
        for p in valid_points:
            # If duplicates exist at same timestamp, average them
            ts = p.timestamp
            if ts in data_dict:
                data_dict[ts] = (data_dict[ts] + p.value) / 2.0
            else:
                data_dict[ts] = float(p.value)

        sorted_items = sorted(data_dict.items(), key=lambda x: x[0])
        timestamps = [item[0] for item in sorted_items]
        values = [item[1] for item in sorted_items]

        dt_index = pd.to_datetime(timestamps)
        series = pd.Series(values, index=dt_index)
        return series, dt_index

    @classmethod
    def calculate_linear_regression(
        cls,
        series: pd.Series,
        alpha: float = 0.05,
    ) -> LinearRegressionResult:
        """
        Ordinary Least Squares regression over time with Student's t-test and 95% CI.
        X is measured in years from the first observation.
        """
        n = len(series)
        if n < 3:
            raise ValueError(f"Linear regression requires at least 3 points; got {n}.")

        start_time = series.index[0]
        # Express x as elapsed fractional years (365.25 days/year)
        x_years = np.array([(t - start_time).total_seconds() / (365.25 * 86400.0) for t in series.index])
        y = series.values

        # Check for constant series
        if np.allclose(y, y[0]):
            return LinearRegressionResult(
                slope=0.0,
                intercept=float(y[0]),
                r_squared=0.0,
                p_value=1.0,
                standard_error=0.0,
                confidence_interval_95=(0.0, 0.0),
                is_significant=False,
            )

        reg = stats.linregress(x_years, y)
        dof = n - 2
        t_crit = stats.t.ppf(1.0 - alpha / 2.0, dof)
        ci_half = t_crit * reg.stderr if reg.stderr else 0.0

        ci_low = float(reg.slope - ci_half)
        ci_high = float(reg.slope + ci_half)

        return LinearRegressionResult(
            slope=round(float(reg.slope), 6),
            intercept=round(float(reg.intercept), 6),
            r_squared=round(float(reg.rvalue ** 2), 4),
            p_value=round(float(reg.pvalue), 6),
            standard_error=round(float(reg.stderr), 6),
            confidence_interval_95=(round(ci_low, 6), round(ci_high, 6)),
            is_significant=bool(reg.pvalue < alpha),
        )

    @classmethod
    def calculate_mann_kendall(
        cls,
        series: pd.Series,
        alpha: float = 0.05,
    ) -> MannKendallResult:
        """
        Mann-Kendall non-parametric monotonic trend test.
        """
        n = len(series)
        if n < 4:
            raise ValueError(f"Mann-Kendall test requires at least 4 observations; got {n}.")

        res = pmk.original_test(series.values, alpha=alpha)

        return MannKendallResult(
            trend=str(res.trend),
            p_value=round(float(res.p), 6),
            z_score=round(float(res.z), 4),
            tau=round(float(res.Tau), 4),
            s_statistic=round(float(res.s), 2),
            var_s=round(float(res.var_s), 2),
            is_significant=bool(res.h),
        )

    @classmethod
    def calculate_sens_slope(
        cls,
        series: pd.Series,
        units: str,
        alpha: float = 0.05,
    ) -> SensSlopeResult:
        """
        Sen's non-parametric robust median slope estimator with rank-based CI.
        Calculates annual change rate using fractional years.
        """
        n = len(series)
        if n < 4:
            raise ValueError(f"Sen's slope requires at least 4 observations; got {n}.")

        start_time = series.index[0]
        x_years = np.array([(t - start_time).total_seconds() / (365.25 * 86400.0) for t in series.index])
        y = series.values

        # Pairwise slopes per fractional year
        slopes: List[float] = []
        for i in range(n):
            for j in range(i + 1, n):
                dt = x_years[j] - x_years[i]
                if dt > 1e-6:
                    slopes.append((y[j] - y[i]) / dt)

        if not slopes:
            slopes = [0.0]

        slopes.sort()
        n_slopes = len(slopes)
        median_slope = float(np.median(slopes))

        # Intercept is median of (y_i - slope * x_i)
        intercepts = y - median_slope * x_years
        median_intercept = float(np.median(intercepts))

        # Non-parametric Hollander-Wolfe rank confidence interval
        # Var(S) under null hypothesis
        var_s = (n * (n - 1) * (2 * n + 5)) / 18.0
        z_crit = stats.norm.ppf(1.0 - alpha / 2.0)
        c_alpha = z_crit * math.sqrt(var_s)

        m1 = int(round((n_slopes - c_alpha) / 2.0))
        m2 = int(round((n_slopes + c_alpha) / 2.0))

        m1 = max(0, min(n_slopes - 1, m1))
        m2 = max(0, min(n_slopes - 1, m2))

        ci_low = float(slopes[m1])
        ci_high = float(slopes[m2])

        return SensSlopeResult(
            slope=round(median_slope, 6),
            intercept=round(median_intercept, 6),
            confidence_interval_95=(round(ci_low, 6), round(ci_high, 6)),
            rate_per_decade=round(median_slope * 10.0, 6),
            rate_unit=f"{units}/year",
        )

    @classmethod
    def calculate_seasonal_mann_kendall(
        cls,
        series: pd.Series,
        period: int = 12,
        alpha: float = 0.05,
    ) -> Optional[SeasonalMannKendallResult]:
        """
        Hirsch-Slack seasonal Mann-Kendall test.
        Requires at least 2 full annual cycles (24 months for monthly data).
        """
        n = len(series)
        if n < period * 2:
            return None

        try:
            res = pmk.seasonal_test(series.values, period=period, alpha=alpha)
            return SeasonalMannKendallResult(
                trend=str(res.trend),
                p_value=round(float(res.p), 6),
                z_score=round(float(res.z), 4),
                tau=round(float(res.Tau), 4),
                is_significant=bool(res.h),
            )
        except Exception:
            return None

    @classmethod
    def calculate_pettitt_test(
        cls,
        series: pd.Series,
        alpha: float = 0.05,
    ) -> PettittTestResult:
        """
        Pettitt's non-parametric rank test for abrupt single change-point in the mean.
        """
        n = len(series)
        if n < 10:
            return PettittTestResult(
                has_change_point=False,
                statistic_k=0.0,
                p_value=1.0,
            )

        y = series.values
        # Compute ranks
        ranks = stats.rankdata(y)

        # Compute U_t for t = 1 .. n-1
        # U_t = 2 * sum_{i=1}^t R_i - t * (n + 1)
        cumsum_ranks = np.cumsum(ranks)
        t_arr = np.arange(1, n)
        u_t = 2.0 * cumsum_ranks[:-1] - t_arr * (n + 1.0)

        abs_u = np.abs(u_t)
        k_idx = int(np.argmax(abs_u))
        k_stat = float(abs_u[k_idx])

        # Approximate p-value: p = 2 * exp( -6 * K^2 / (n^3 + n^2) )
        exponent = -6.0 * (k_stat ** 2) / ((n ** 3) + (n ** 2))
        p_val = float(2.0 * math.exp(exponent))
        p_val = min(1.0, max(0.0, p_val))

        has_change = p_val < alpha
        change_date_str = str(series.index[k_idx].date()) if has_change else None
        pre_mean = float(np.mean(y[: k_idx + 1])) if has_change else None
        post_mean = float(np.mean(y[k_idx + 1 :])) if has_change else None

        return PettittTestResult(
            has_change_point=has_change,
            change_point_index=k_idx if has_change else None,
            change_point_date=change_date_str,
            statistic_k=round(k_stat, 2),
            p_value=round(p_val, 6),
            pre_shift_mean=round(pre_mean, 4) if pre_mean is not None else None,
            post_shift_mean=round(post_mean, 4) if post_mean is not None else None,
        )

    @classmethod
    def calculate_standardized_anomalies(
        cls,
        series: pd.Series,
    ) -> StandardizedAnomalyResult:
        """
        Compute multi-year monthly climatological baseline and normalized Z-score anomalies.
        """
        df = pd.DataFrame({"val": series.values, "month": series.index.month}, index=series.index)

        # Compute monthly baseline mean and std across all available years
        monthly_means = df.groupby("month")["val"].mean().to_dict()
        monthly_stds = df.groupby("month")["val"].std().fillna(1.0).to_dict()
        # Ensure zero std doesn't divide by zero
        for m in monthly_stds:
            if monthly_stds[m] < 1e-6:
                monthly_stds[m] = 1.0

        anomaly_points: List[AnomalyPoint] = []
        pos_extremes = 0
        neg_extremes = 0

        for ts, row in df.iterrows():
            m = int(row["month"])
            obs = float(row["val"])
            clim_mean = float(monthly_means[m])
            clim_std = float(monthly_stds[m])
            diff = obs - clim_mean
            z = diff / clim_std

            is_ext = abs(z) >= 2.0
            if z >= 2.0:
                pos_extremes += 1
            elif z <= -2.0:
                neg_extremes += 1

            anomaly_points.append(
                AnomalyPoint(
                    timestamp=str(ts.date()),
                    observed_value=round(obs, 4),
                    climatological_mean=round(clim_mean, 4),
                    anomaly_value=round(diff, 4),
                    z_score=round(z, 3),
                    is_extreme=is_ext,
                )
            )

        mean_dict = {f"month_{k:02d}": round(float(v), 4) for k, v in monthly_means.items()}
        std_dict = {f"month_{k:02d}": round(float(v), 4) for k, v in monthly_stds.items()}

        return StandardizedAnomalyResult(
            monthly_climatology_mean=mean_dict,
            monthly_climatology_std=std_dict,
            anomalies=anomaly_points,
            extreme_positive_count=pos_extremes,
            extreme_negative_count=neg_extremes,
        )

    @classmethod
    def generate_plain_language_narrative(
        cls,
        variable_name: str,
        units: str,
        region_name: str,
        start_date: str,
        end_date: str,
        sens: SensSlopeResult,
        mk: MannKendallResult,
        pettitt: PettittTestResult,
        alpha: float = 0.05,
    ) -> str:
        """
        Generate plain-language interpretation grounded purely in computed statistical metrics.
        Never fabricates causality or claims certainty beyond statistical evidence.
        """
        direction_text = "stable (no monotonic trend)"
        if mk.is_significant:
            direction_text = f"statistically significant {mk.trend}"

        annual_rate = abs(sens.slope)
        rate_str = f"{annual_rate:.4g} {units}/year"
        decade_str = f"{abs(sens.rate_per_decade):.4g} {units}/decade"

        significance_desc = (
            f"statistically significant (p = {mk.p_value:.4f} < {alpha})"
            if mk.is_significant
            else f"not statistically significant at the 95% confidence level (p = {mk.p_value:.4f} >= {alpha})"
        )

        break_desc = "No abrupt structural break point was identified across the record."
        if pettitt.has_change_point and pettitt.change_point_date:
            break_desc = (
                f"An abrupt change point was detected around {pettitt.change_point_date} (p = {pettitt.p_value:.4f}), "
                f"where the mean shifted from {pettitt.pre_shift_mean:.4g} to {pettitt.post_shift_mean:.4g} {units}."
            )

        narrative = (
            f"Between {start_date} and {end_date}, observations for {variable_name} over {region_name} "
            f"exhibited an estimated {direction_text} trajectory. "
            f"Using Sen's robust non-parametric slope estimator, the median rate of change is {rate_str} "
            f"({decade_str}, 95% confidence interval: [{sens.confidence_interval_95[0]:.4g}, {sens.confidence_interval_95[1]:.4g}]). "
            f"The Mann-Kendall rank correlation test indicates this trend is {significance_desc} (Kendall's tau = {mk.tau:+.3f}). "
            f"{break_desc} "
            f"Statistical significance establishes an observational pattern across the historical period; "
            f"it does not by itself establish physical causality or guarantee future continuation."
        )
        return narrative

    @classmethod
    def run_comprehensive_analysis(
        cls,
        points: List[ObservationPoint],
        variable_id: str,
        original_units: str,
        region_name: str = "Selected Geographic Region",
        variable_name: Optional[str] = None,
        alpha: float = 0.05,
    ) -> ComprehensiveAnalysisResult:
        """
        Run the complete suite of statistical trend detection methods on an observation series.
        """
        total_obs = len(points)
        series, dt_index = cls._clean_series(points)
        valid_obs = len(series)
        coverage_frac = float(valid_obs / total_obs) if total_obs > 0 else 0.0

        start_date_str = str(series.index[0].date())
        end_date_str = str(series.index[-1].date())
        var_display = variable_name or variable_id

        # Calculate all methods
        linreg = cls.calculate_linear_regression(series, alpha=alpha)
        mk = cls.calculate_mann_kendall(series, alpha=alpha)
        sens = cls.calculate_sens_slope(series, units=original_units, alpha=alpha)
        seasonal_mk = cls.calculate_seasonal_mann_kendall(series, period=12, alpha=alpha)
        pettitt = cls.calculate_pettitt_test(series, alpha=alpha)
        anomalies = cls.calculate_standardized_anomalies(series)

        # Generate narrative
        narrative = cls.generate_plain_language_narrative(
            variable_name=var_display,
            units=original_units,
            region_name=region_name,
            start_date=start_date_str,
            end_date=end_date_str,
            sens=sens,
            mk=mk,
            pettitt=pettitt,
            alpha=alpha,
        )

        limitations = [
            f"Data Coverage: {coverage_frac * 100.0:.1f}% valid observations ({valid_obs}/{total_obs} temporal intervals).",
            "Autocorrelation: Serial dependence in environmental time series can inflate test statistics; seasonal Mann-Kendall is advised for cyclic series.",
            "Measurement Uncertainty: Satellite retrievals are subject to cloud obscuration, atmospheric attenuation, and instrument degradation.",
            "Causality Disclaimer: Statistical trend detection proves historical monotonic change, not mechanical or ecological causality.",
        ]

        if valid_obs < 15:
            limitations.append(
                f"Small Sample Warning: Analysis contains only {valid_obs} observations. Statistical tests have reduced power with N < 15."
            )

        return ComprehensiveAnalysisResult(
            variable_id=variable_id,
            original_units=original_units,
            observation_count=total_obs,
            valid_observation_count=valid_obs,
            data_coverage_fraction=round(coverage_frac, 4),
            time_range_start=start_date_str,
            time_range_end=end_date_str,
            significance_threshold=alpha,
            overall_trend_direction=mk.trend if mk.is_significant else "no significant trend",
            is_statistically_significant=mk.is_significant,
            linear_regression=linreg,
            mann_kendall=mk,
            sens_slope=sens,
            seasonal_mann_kendall=seasonal_mk,
            pettitt_change_point=pettitt,
            standardized_anomalies=anomalies,
            plain_language_interpretation=narrative,
            scientific_limitations=limitations,
        )


# Global analyzer singleton
analyzer = ScientificTrendAnalyzer()

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from pydantic import BaseModel, Field

from backend.app.models.common import ObservationPoint, ScientificTimeSeries


class TemporalFrequency(str, Enum):
    DAILY = "daily"
    MONTHLY = "monthly"
    ANNUAL = "annual"


class AggregationStatistic(str, Enum):
    MEAN = "mean"
    SUM = "sum"
    MEDIAN = "median"
    MIN = "min"
    MAX = "max"


class AggregatedPoint(BaseModel):
    """Single resampled observation point."""
    timestamp: datetime = Field(..., description="Start of aggregated time interval (UTC)")
    period_label: str = Field(..., description="Human-readable interval string (e.g. '2023-01' or '2023')")
    value: Optional[float] = Field(None, description="Aggregated metric in original physical units")
    valid_count: int = Field(..., description="Number of valid observations in interval")
    total_count: int = Field(..., description="Total intervals evaluated")
    std_dev: Optional[float] = Field(None, description="Sample standard deviation within the interval")
    min_value: Optional[float] = Field(None, description="Minimum value within interval")
    max_value: Optional[float] = Field(None, description="Maximum value within interval")


class AggregatedTimeSeries(BaseModel):
    """Standardized aggregated time series response."""
    dataset_id: str
    variable_id: str
    original_units: str
    frequency: TemporalFrequency
    statistic: AggregationStatistic
    total_original_points: int
    total_aggregated_points: int
    points: List[AggregatedPoint]
    summary_mean: Optional[float] = None
    summary_min: Optional[float] = None
    summary_max: Optional[float] = None


class TimeSeriesAggregationService:
    """
    Scientific service for temporal aggregation and resampling of Earth observation time series.
    Preserves original physical units and computes observational coverage statistics.
    """

    @classmethod
    def aggregate_points(
        cls,
        points: List[ObservationPoint],
        dataset_id: str,
        variable_id: str,
        original_units: str,
        frequency: TemporalFrequency = TemporalFrequency.MONTHLY,
        statistic: AggregationStatistic = AggregationStatistic.MEAN,
    ) -> AggregatedTimeSeries:
        if not points:
            raise ValueError("Cannot aggregate empty observation points list.")

        # Convert to pandas DataFrame
        records = []
        for p in points:
            if p.is_valid and p.value is not None and not np.isnan(p.value):
                records.append({"timestamp": p.timestamp, "value": float(p.value), "is_valid": True})
            else:
                records.append({"timestamp": p.timestamp, "value": np.nan, "is_valid": False})

        df = pd.DataFrame(records)
        df["timestamp"] = pd.to_datetime(df["timestamp"])
        df.set_index("timestamp", inplace=True)
        df.sort_index(inplace=True)

        freq_map = {
            TemporalFrequency.DAILY: "1D",
            TemporalFrequency.MONTHLY: "1MS",  # Month Start
            TemporalFrequency.ANNUAL: "1YS",   # Year Start
        }
        resample_code = freq_map[frequency]

        resampler = df.resample(resample_code)
        
        aggregated_points: List[AggregatedPoint] = []
        all_vals: List[float] = []

        for period_start, group in resampler:
            valid_subset = group[group["is_valid"] & group["value"].notna()]
            n_valid = len(valid_subset)
            n_total = len(group)

            if frequency == TemporalFrequency.DAILY:
                label = period_start.strftime("%Y-%m-%d")
            elif frequency == TemporalFrequency.MONTHLY:
                label = period_start.strftime("%Y-%m")
            else:
                label = period_start.strftime("%Y")

            if n_valid == 0:
                aggregated_points.append(
                    AggregatedPoint(
                        timestamp=period_start.to_pydatetime().replace(tzinfo=timezone.utc),
                        period_label=label,
                        value=None,
                        valid_count=0,
                        total_count=n_total,
                        std_dev=None,
                        min_value=None,
                        max_value=None,
                    )
                )
                continue

            vals = valid_subset["value"].values
            if statistic == AggregationStatistic.MEAN:
                agg_val = float(np.mean(vals))
            elif statistic == AggregationStatistic.SUM:
                agg_val = float(np.sum(vals))
            elif statistic == AggregationStatistic.MEDIAN:
                agg_val = float(np.median(vals))
            elif statistic == AggregationStatistic.MIN:
                agg_val = float(np.min(vals))
            elif statistic == AggregationStatistic.MAX:
                agg_val = float(np.max(vals))
            else:
                agg_val = float(np.mean(vals))

            std_val = float(np.std(vals, ddof=1)) if len(vals) > 1 else 0.0
            min_val = float(np.min(vals))
            max_val = float(np.max(vals))

            all_vals.append(agg_val)

            aggregated_points.append(
                AggregatedPoint(
                    timestamp=period_start.to_pydatetime().replace(tzinfo=timezone.utc),
                    period_label=label,
                    value=round(agg_val, 6),
                    valid_count=n_valid,
                    total_count=n_total,
                    std_dev=round(std_val, 6) if std_val is not None else None,
                    min_value=round(min_val, 6),
                    max_value=round(max_val, 6),
                )
            )

        summary_mean = float(np.mean(all_vals)) if all_vals else None
        summary_min = float(np.min(all_vals)) if all_vals else None
        summary_max = float(np.max(all_vals)) if all_vals else None

        return AggregatedTimeSeries(
            dataset_id=dataset_id,
            variable_id=variable_id,
            original_units=original_units,
            frequency=frequency,
            statistic=statistic,
            total_original_points=len(points),
            total_aggregated_points=len(aggregated_points),
            points=aggregated_points,
            summary_mean=round(summary_mean, 6) if summary_mean is not None else None,
            summary_min=round(summary_min, 6) if summary_min is not None else None,
            summary_max=round(summary_max, 6) if summary_max is not None else None,
        )


timeseries_service = TimeSeriesAggregationService()

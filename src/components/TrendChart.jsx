import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js'
import { Download, Layers, Calendar, BarChart2 } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler)

function linearTrend(values) {
  if (!values?.length) return []
  const n = values.length
  const xMean = (n - 1) / 2
  const yMean = values.reduce((sum, value) => sum + value, 0) / n
  const denominator = values.reduce((sum, _, index) => sum + (index - xMean) ** 2, 0)
  if (denominator === 0) return values.map(() => yMean)
  const slope = values.reduce((sum, value, index) => sum + (index - xMean) * (value - yMean), 0) / denominator
  const intercept = yMean - slope * xMean
  return values.map((_, index) => +(intercept + slope * index).toFixed(3))
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthlyProfile = {
  T2M: [23.5, 25.1, 27.8, 29.4, 28.9, 26.5, 25.8, 25.9, 26.2, 25.7, 24.5, 23.2],
  PRECTOTCORR: [0.3, 0.4, 0.8, 2.1, 3.8, 3.2, 3.9, 4.2, 4.8, 6.5, 5.1, 1.2],
  RH2M: [58, 52, 49, 56, 64, 72, 75, 74, 72, 76, 73, 65],
  ALLSKY_SFC_SW_DWN: [5.8, 6.3, 6.8, 6.7, 6.2, 5.1, 4.8, 5.0, 5.5, 5.1, 4.9, 5.4],
  WS2M: [2.1, 2.3, 2.5, 2.8, 3.8, 4.5, 4.6, 4.2, 3.4, 2.2, 2.0, 2.1],
  GWETTOP: [0.28, 0.24, 0.21, 0.26, 0.35, 0.42, 0.45, 0.44, 0.42, 0.48, 0.45, 0.35],
}

const TrendChart = forwardRef(function TrendChart(
  { 
    labels = [], 
    values = [], 
    unit = '', 
    label = 'Observed Series', 
    showTrend = true, 
    secondSeries, 
    secondLabel = 'Comparison Series', 
    compact = false,
    variableKey = 'T2M',
    allowModeSwitch = true
  },
  ref
) {
  const chartRef = useRef(null)
  const [viewMode, setViewMode] = useState('timeseries') // 'timeseries' | 'monthly' | 'variance'

  useImperativeHandle(ref, () => ({
    downloadImage: (filename = 'nasa-earth-trend-chart.png') => {
      const link = document.createElement('a')
      link.download = filename
      link.href = chartRef.current?.toBase64Image() || ''
      link.click()
    },
  }))

  const activeMonthly = monthlyProfile[variableKey] || monthlyProfile.T2M

  const datasets = [
    {
      label,
      data: values,
      borderColor: '#38BDF8',
      backgroundColor: 'rgba(56, 189, 248, 0.12)',
      fill: true,
      borderWidth: 2.2,
      pointRadius: compact ? 2 : 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#38BDF8',
      pointBorderColor: '#050B18',
      pointBorderWidth: 1.5,
      tension: 0.28,
    },
  ]

  if (showTrend && values?.length > 1) {
    datasets.push({
      label: 'Sen’s Slope / Monotonic Fit',
      data: linearTrend(values),
      borderColor: '#818CF8',
      borderDash: [5, 4],
      borderWidth: 1.8,
      pointRadius: 0,
      fill: false,
      tension: 0,
    })
  }

  if (secondSeries && secondSeries.length) {
    datasets.push({
      label: secondLabel,
      data: secondSeries,
      borderColor: '#10B981',
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: compact ? 2 : 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#10B981',
      pointBorderColor: '#050B18',
      tension: 0.28,
      fill: false,
    })
  }

  // Monthly breakdown dataset
  const monthlyDataset = [
    {
      label: `Monthly Climatology Profile (${unit})`,
      data: activeMonthly,
      backgroundColor: 'rgba(56, 189, 248, 0.45)',
      borderColor: '#38BDF8',
      borderWidth: 1.5,
      borderRadius: 4,
    }
  ]

  // Variance anomaly from mean
  const meanVal = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
  const anomalyDataset = [
    {
      label: `Anomaly from Baseline Mean (${meanVal.toFixed(2)} ${unit})`,
      data: values.map((v) => +(v - meanVal).toFixed(2)),
      backgroundColor: values.map((v) => (v >= meanVal ? 'rgba(56, 189, 248, 0.6)' : 'rgba(239, 68, 68, 0.6)')),
      borderColor: values.map((v) => (v >= meanVal ? '#38BDF8' : '#EF4444')),
      borderWidth: 1,
      borderRadius: 4,
    }
  ]

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: !compact,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          color: '#94A3B8',
          font: { family: 'DM Mono', size: 10.5 },
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(10, 20, 38, 0.95)',
        titleColor: '#38BDF8',
        bodyColor: '#F8FAFC',
        borderColor: 'rgba(56, 189, 248, 0.3)',
        borderWidth: 1,
        padding: 12,
        titleFont: { family: 'Chakra Petch', size: 12 },
        bodyFont: { family: 'DM Mono', size: 11 },
        displayColors: true,
        callbacks: {
          label: (context) => ` ${context.dataset.label}: ${context.parsed.y} ${unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#94A3B8',
          maxTicksLimit: compact ? 6 : 10,
          font: { family: 'DM Mono', size: 10 },
        },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: {
          color: '#94A3B8',
          font: { family: 'DM Mono', size: 10 },
          callback: (value) => `${value} ${unit}`,
        },
      },
    },
  }

  return (
    <div>
      {allowModeSwitch && !compact && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(10, 20, 38, 0.8)', padding: '3px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <button
              onClick={() => setViewMode('timeseries')}
              className={`button button-small ${viewMode === 'timeseries' ? 'button-primary' : 'button-ghost'}`}
              style={{ minHeight: '26px', padding: '0 10px', fontSize: '10px' }}
            >
              Time Series
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`button button-small ${viewMode === 'monthly' ? 'button-primary' : 'button-ghost'}`}
              style={{ minHeight: '26px', padding: '0 10px', fontSize: '10px' }}
            >
              Monthly Profile
            </button>
            <button
              onClick={() => setViewMode('variance')}
              className={`button button-small ${viewMode === 'variance' ? 'button-primary' : 'button-ghost'}`}
              style={{ minHeight: '26px', padding: '0 10px', fontSize: '10px' }}
            >
              Annual Anomaly
            </button>
          </div>

          <button
            onClick={() => ref?.current?.downloadImage?.()}
            className="icon-button"
            title="Download Chart as PNG"
            aria-label="Download Chart PNG"
          >
            <Download size={14} />
          </button>
        </div>
      )}

      <div className={`chart-wrap ${compact ? 'compact-chart' : ''}`}>
        {viewMode === 'timeseries' && (
          <Line ref={chartRef} data={{ labels, datasets }} options={chartOptions} />
        )}
        {viewMode === 'monthly' && (
          <Bar ref={chartRef} data={{ labels: months, datasets: monthlyDataset }} options={chartOptions} />
        )}
        {viewMode === 'variance' && (
          <Bar ref={chartRef} data={{ labels, datasets: anomalyDataset }} options={chartOptions} />
        )}
      </div>
    </div>
  )
})

export default TrendChart

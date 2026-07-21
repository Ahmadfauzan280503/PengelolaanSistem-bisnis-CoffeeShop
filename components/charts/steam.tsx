import React from "react";
import Chart, { Props } from "react-apexcharts";

const state: Props["series"] = [
  {
    name: "Penjualan Kotor (Gross)",
    data: [1500000, 2300000, 1800000, 3100000, 4200000, 5600000, 6100000],
  },
  {
    name: "Penjualan Bersih (Net)",
    data: [1300000, 2000000, 1500000, 2800000, 3800000, 5000000, 5400000],
  },
];

const options: Props["options"] = {
  chart: {
    type: "area",
    animations: {
      // @ts-ignore
      easing: "easeinout",
      speed: 800,
    },
    sparkline: {
      enabled: false,
    },
    brush: {
      enabled: false,
    },
    id: "revenue-trend",
    foreColor: "#6b7280",
    stacked: false,
    toolbar: {
      show: false,
    },
    background: "transparent",
  },

  xaxis: {
    categories: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
    labels: {
      style: {
        colors: "#6b7280",
        fontWeight: 600,
      },
    },
    axisBorder: {
      color: "#1e1e2e",
    },
    axisTicks: {
      color: "#1e1e2e",
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: "#6b7280",
        fontWeight: 600,
      },
      formatter: (value) => {
        return "Rp " + (value / 1000000).toFixed(1).replace(".", ",") + " Jt";
      }
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number) {
      return new Intl.NumberFormat("id-ID").format(val);
    },
    style: {
      fontSize: '10px',
      fontWeight: 'bold',
      colors: ['#fff']
    },
    background: {
      enabled: true,
      foreColor: '#a855f7',
      borderRadius: 4,
      padding: 4,
      borderColor: '#a855f7',
    }
  },
  tooltip: {
    enabled: true,
    theme: "dark",
    x: {
      formatter: function (val, { dataPointIndex }) {
        const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
        const today = new Date();
        const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
        const diff = dataPointIndex - currentDayIndex;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + diff);
        return days[dataPointIndex] + ", " + targetDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    },
    y: {
      formatter: function (val) {
        return "Rp " + new Intl.NumberFormat("id-ID").format(val);
      }
    }
  },
  grid: {
    show: true,
    borderColor: "#1e1e2e",
    strokeDashArray: 4,
    position: "back",
  },
  stroke: {
    curve: "smooth",
    width: 3,
  },
  colors: ["#a855f7", "#22d3ee"],
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.02,
      stops: [0, 100]
    }
  },
  markers: {
    size: 5,
    colors: ["#12121a"],
    strokeColors: ["#a855f7", "#22d3ee"],
    strokeWidth: 3,
    hover: {
      size: 8,
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
    labels: {
      colors: "#9ca3af"
    }
  }
};

export const Steam = () => {
  return (
    <>
      <div className="w-full z-20">
        <div id="chart">
          <Chart options={options} series={state} type="area" height={425} />
        </div>
      </div>
    </>
  );
};

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalysisChart = ({ resumes, onBarClick }) => {
  // 1. Process the resume data to group scores into bins
  const scoreBins = {
    '0-10': 0, '11-20': 0, '21-30': 0, '31-40': 0, '41-50': 0,
    '51-60': 0, '61-70': 0, '71-80': 0, '81-90': 0, '91-100': 0,
  };

  resumes.forEach(resume => {
    const score = resume.analysis.match_score;
    if (score <= 10) scoreBins['0-10']++;
    else if (score <= 20) scoreBins['11-20']++;
    else if (score <= 30) scoreBins['21-30']++;
    else if (score <= 40) scoreBins['31-40']++;
    else if (score <= 50) scoreBins['41-50']++;
    else if (score <= 60) scoreBins['51-60']++;
    else if (score <= 70) scoreBins['61-70']++;
    else if (score <= 80) scoreBins['71-80']++;
    else if (score <= 90) scoreBins['81-90']++;
    else if (score <= 100) scoreBins['91-100']++;
  });

  // 2. Format the data for the chart library
  const chartData = {
    labels: Object.keys(scoreBins),
    datasets: [
      {
        label: '# of Resumes',
        data: Object.values(scoreBins),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // 3. Configure chart options, including the click handler
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Resume Score Distribution' },
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && onBarClick) {
        const clickedElementIndex = elements[0].index;
        const label = chartData.labels[clickedElementIndex]; // e.g., "51-60"
        const [min, max] = label.split('-').map(Number);
        onBarClick({ min, max }); // Call the function passed via props
      }
    },
    scales: {
        y: {
            title: { display: true, text: 'Number of Resumes' },
            ticks: { stepSize: 1 } // Ensure Y-axis shows whole numbers
        },
        x: {
            title: { display: true, text: 'Match Score Percentage (%)' }
        }
    }
  };

  return <Bar options={options} data={chartData} />;
};

export default AnalysisChart;
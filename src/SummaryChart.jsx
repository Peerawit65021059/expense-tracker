import { Doughnut } from 'react-chartjs-2';

const data = {
  labels: ['Food', 'Transport', 'Shopping'],
  datasets: [{
    data: [300, 150, 200],
    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
  }]
};

<Doughnut data={data} />

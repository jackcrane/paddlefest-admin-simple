import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  LineChart,
} from "recharts";

import { format } from "date-fns";

const processRegistrationData = (data) => {
  // object to hold counts of registrations per day
  const registrationsPerDay = {};

  data.forEach((item) => {
    // we're only interested in the date, not the time
    const date = format(new Date(item.createdAt), "yyyy-MM-dd");

    // increment the count for this date, or set to 1 if not yet set
    registrationsPerDay[date] = (registrationsPerDay[date] || 0) + 1;
  });

  // convert the object to an array of objects
  return Object.keys(registrationsPerDay).map((date) => ({
    date,
    count: registrationsPerDay[date],
  }));
};

export const RegistrationChart = ({ registrations }) => {
  const processedData = processRegistrationData(registrations);

  return (
    <LineChart
      width={500}
      height={300}
      data={processedData}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line dataKey="count" fill="#007aaF" />
    </LineChart>
  );
};

export default RegistrationChart;

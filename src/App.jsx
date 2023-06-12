import React, { useEffect, useState } from "react";

export default () => {
  const [volunteers, setVolunteers] = useState(null);
  const [shifts, setShifts] = useState(null);

  useEffect(() => {
    fetch("https://volunteer.jackcrane.rocks/admin/volunteers")
      .then((res) => res.json())
      .then((volunteers) => setVolunteers(volunteers))
      .catch((err) =>
        alert("Something went wrong fetching volunteers. go yell at jack")
      );
  }, []);

  useEffect(() => {
    fetch("https://volunteer.jackcrane.rocks/admin/shifts")
      .then((res) => res.json())
      .then((shifts) => setShifts(shifts))
      .catch((err) =>
        alert("Something went wrong fetching shifts. go yell at jack")
      );
  }, []);

  if (volunteers === null || shifts === null) {
    return <p>Loading...........</p>;
  }

  return (
    <>
      <h1>Volunteers</h1>
      <p>Total of {volunteers.length} volunteers.</p>
      <table>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Shirt size</th>
        </tr>
        {volunteers.map((volunteer) => (
          <tr>
            <td>{volunteer.name}</td>
            <td>
              <a href={`tel:${volunteer.phone}`}>{volunteer.phone}</a>
            </td>
            <td>
              <a href={`mailto:${volunteer.email}`}>{volunteer.email}</a>
            </td>
            <td>{volunteer.shirtSize}</td>
          </tr>
        ))}
      </table>
    </>
  );
};

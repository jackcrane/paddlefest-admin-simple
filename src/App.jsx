import React, { useEffect, useState } from "react";
import { Modal } from "./components/modal";
import { H2, Spacer, TextInput } from "./kit";
import { VolunteerModal } from "./VolunteerModal";
import useFromNow from "./lib/useFromNow";
import moment from "moment";
import EventEmitter from "eventemitter3";

export const EventHandler = new EventEmitter();

export default () => {
  const [volunteers, setVolunteers] = useState(null);
  const [shifts, setShifts] = useState(null);

  const [loadedAt, setLoadedAt] = useState(null);
  const fromNow = useFromNow(loadedAt);

  const getVolunteers = () => {
    fetch("https://volunteer.jackcrane.rocks/admin/volunteers")
      .then((res) => res.json())
      .then((volunteers) => setVolunteers(volunteers))
      .catch((err) =>
        alert("Something went wrong fetching volunteers. go yell at jack")
      )
      .finally(() => setLoadedAt(new Date()));
  };

  const getShifts = () => {
    fetch("https://volunteer.jackcrane.rocks/admin/shifts")
      .then((res) => res.json())
      .then((shifts) => setShifts(shifts))
      .catch((err) =>
        alert("Something went wrong fetching shifts. go yell at jack")
      );
  };

  useEffect(() => {
    getVolunteers();
    getShifts();
    EventHandler.on("volunteer:updated", getVolunteers);
    EventHandler.on("shift:updated", getShifts);
  }, []);

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  const [query, setQuery] = useState("");
  const filter = (volunteers) => {
    if (query === "") {
      return volunteers;
    }
    return volunteers.filter((volunteer) => {
      return (
        volunteer.name.includes(query) ||
        volunteer.email.includes(query) ||
        volunteer.phone.includes(query)
      );
    });
  };

  if (volunteers === null || shifts === null) {
    return <p>Loading...........</p>;
  }

  return (
    <>
      <h1>Volunteers</h1>
      <p>
        Total of {volunteers.length} volunteers, loaded {fromNow} (
        {moment(loadedAt).format("hh:mm:ss a")}).
      </p>
      <TextInput
        placeholder="Search"
        style={{ fontSize: "1em" }}
        onInput={(e) => setQuery(e.target.value)}
      />
      <Spacer height="20px" />
      <div className="oxa">
        <table>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Shirt size</th>
          </tr>
          {filter(volunteers).map((volunteer) => (
            <tr onClick={() => setSelectedVolunteer(volunteer)}>
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
      </div>
      <VolunteerModal
        volunteer={selectedVolunteer}
        onClose={() => setSelectedVolunteer(null)}
        isOpen={selectedVolunteer !== null}
      />
      <Spacer height="50px" />
    </>
  );
};

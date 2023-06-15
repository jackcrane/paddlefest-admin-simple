import React, { useEffect, useState } from "react";
import { Modal } from "./components/modal";
import styled from "styled-components";
import {
  Between,
  Column,
  DangerActionButton,
  H2,
  Hr,
  Row,
  ShiftPill,
  Spacer,
} from "./kit";
import moment from "moment";
import { HSLA } from "./lib/color";
import { EventHandler } from "./App";
import { transformData } from "./VolunteerModal";
import { toast } from "react-hot-toast";

export const Dropdown = styled.details`
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 1em;
`;

export const Summary = styled.summary`
  cursor: pointer;
`;

const _ShiftRow = styled.button`
  border: 1px solid #007aaf;
  color: #007aaf;
  cursor: pointer;
  border-radius: 4px;
  padding: 5px 10px;
  margin-right: 5px;
  margin-bottom: 5px;
  background-color: ${(props) =>
    props.selected ? HSLA("#007aaF", 0.4) : "transparent"};
`;

const Shift = ({ shift, volunteer }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    console.log("Setting active");
    /// check if shift is in volunteer.shift by shiftId
    let shiftInVolunteer = false;
    volunteer.shifts.forEach((volunteerShift) => {
      if (volunteerShift.shiftId === shift.id) {
        shiftInVolunteer = true;
        console.log("Shift in volunteer");
      }
    });
    if (shiftInVolunteer) {
      setActive(true);
    } else {
      setActive(false);
    }
  }, [volunteer]);

  const toggle = async () => {
    let _active = active;
    setActive(!active);
    toast("Updating shift...");
    const f = await fetch(
      `https://volunteer.jackcrane.rocks/admin/volunteer/${volunteer.id}/shift/${shift.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selected: !_active,
        }),
      }
    );
    if (!f.ok) {
      setActive(_active);
      toast.error("Something went wrong. Go yell at Jack.");
    } else {
      EventHandler.emit("volunteer:updated");
      EventHandler.emit("shift:updated");
      toast.success("Shift updated!");
    }
  };

  return (
    <_ShiftRow
      selected={active}
      onClick={toggle}
      data-volunteer={JSON.stringify(
        volunteer.shifts.map((shift) => shift.shiftId)
      )}
      data-shift={JSON.stringify(shift.id)}
    >
      {/* {shift.startTime} - {shift.endTime} */}
      {moment(shift.startTime).format("h:mm a")} -{" "}
      {moment(shift.endTime).format("h:mm a")}
    </_ShiftRow>
  );
};

export const organizeJobsByLocation = (jobs) => {
  const locations = [];
  // locations should look like: [{id, locationName, jobs: [{id, jobName, shifts: [{id, shiftName, volunteers: [{id, volunteerName, volunteerEmail, volunteerPhone}]}]}]}]
  jobs.forEach((job) => {
    const location = locations.find(
      (location) => location.id === job.locationId
    );
    if (location) {
      locations[locations.indexOf(location)].jobs.push(job);
    } else {
      locations.push({
        id: job.locationId,
        name: job.location.name,
        jobs: [job],
      });
    }
  });
  console.log(locations);
  return locations;
};

export const ShiftsModal = ({ isOpen, onClose, shifts, volunteer }) => {
  const [allShifts, setAllShifts] = useState(null);
  const [localVolunteer, setLocalVolunteer] = useState(volunteer);
  const loadShifts = () => {
    fetch("https://volunteer.jackcrane.rocks/admin/jobs")
      .then((res) => res.json())
      .then((shifts) => setAllShifts(shifts))
      .catch((err) =>
        toast.error("Something went wrong fetching shifts. go yell at jack")
      );
    // .finally(() => console.log(allShifts));
  };

  const getVolunteer = async () => {
    const f = await fetch(
      `https://volunteer.jackcrane.rocks/admin/volunteers/${volunteer.id}`
    );
    if (!f.ok) {
      toast.error("Something went wrong. Yell at Jack.");
      return;
    }
    const res = await f.json();
    setLocalVolunteer(res);
  };

  useEffect(() => {
    EventHandler.on("volunteer:updated", getVolunteer);
    EventHandler.on("shift:updated", getVolunteer);
    return () => {
      EventHandler.off("volunteer:updated", getVolunteer);
      EventHandler.off("shift:updated", getVolunteer);
    };
  }, []);

  useEffect(() => {
    loadShifts();
  }, []);

  if (!allShifts) {
    return <div>Loading...</div>;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Between>
        <H2>Shifts for {localVolunteer.name}</H2>
        <DangerActionButton onClick={onClose}>Close</DangerActionButton>
      </Between>
      <Spacer />
      <Column>
        {transformData(localVolunteer.shifts).map((job) => (
          <>
            <u>
              {job.jobName} ({job.jobLocation})
            </u>
            <Row>
              {job.shifts.map((shift) => (
                <ShiftPill>
                  {new moment(shift.startTime).format("h:mm a")} -{" "}
                  {new moment(shift.endTime).format("h:mm a")}
                </ShiftPill>
              ))}
            </Row>
          </>
        ))}
      </Column>
      <Spacer />
      <Hr />
      <Spacer />
      <Column>
        {organizeJobsByLocation(allShifts).map((location) => (
          <Dropdown>
            <Summary>{location.name}</Summary>
            <Spacer />
            <Column gap="5px">
              {location.jobs.map((job) => (
                <Dropdown data-job={JSON.stringify(job)}>
                  <Summary>{job.name}</Summary>
                  <Spacer />
                  {job.shifts.map((shift) => (
                    <Shift shift={shift} volunteer={localVolunteer} />
                  ))}
                </Dropdown>
              ))}
            </Column>
          </Dropdown>
        ))}
      </Column>
    </Modal>
  );
};

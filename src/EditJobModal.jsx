import React, { useEffect, useState } from "react";
import { Modal } from "./components/modal";
import styled from "styled-components";
import {
  ActionButton,
  Between,
  Column,
  DangerActionButton,
  H2,
  H3,
  Hr,
  MicroDangerActionButton,
  Row,
  Select,
  ShiftPill,
  Spacer,
  TextInput,
} from "./kit";
import moment from "moment-timezone";
import { HSLA } from "./lib/color";
import { EventHandler } from "./App";
import { transformData } from "./VolunteerModal";
import { toast } from "react-hot-toast";
import { Summary } from "./ShiftsModal";
import { v4 as uuidv4 } from "uuid";

export const Dropdown = styled.details`
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 1em;
`;

moment.tz.setDefault("GMT");

function findNextShift(shifts) {
  if (!shifts || shifts.length === 0) return [new Date(), new Date()];
  shifts.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));

  const lastShift = shifts[shifts.length - 1];
  const duration = new Date(lastShift.endTime) - new Date(lastShift.startTime);

  const nextStartTime = new Date(lastShift.endTime);
  const nextEndTime = new Date(nextStartTime.getTime() + duration);

  return [nextStartTime.toISOString(), nextEndTime.toISOString()];
}

export const EditJobModal = ({ isOpen, onClose, job, requestRefetch }) => {
  const [localJob, setLocalJob] = useState(job);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    job?.shifts?.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    setLocalJob(job);
  }, [job]);

  useEffect(() => {
    fetch("https://volunteer.jackcrane.rocks/admin/jobs")
      .then((res) => res.json())
      .then((jobs) => {
        let locations = jobs.map((job) => job.location);
        // Remove duplicate objects from array
        locations = locations.filter(
          (v, i, a) => a.findIndex((t) => t.id === v.id) === i
        );
        setLocations(locations);
      })
      .catch((err) => {
        toast.error("Something went wrong fetching jobs. go yell at jack");
      });
  }, [job]);

  const submitLocalJob = () => {
    const f = fetch("https://volunteer.jackcrane.rocks/admin/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(localJob),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        toast.promise(Promise.resolve(), {
          loading: "Saving job...",
          success: "Job saved",
          error: "Something went wrong saving the job",
        });
        onClose();
        requestRefetch();
      })
      .catch((err) => {
        console.error(err);
        toast.promise(Promise.reject(), {
          loading: "Saving job...",
          success: "Job saved",
          error: "Something went wrong saving the job",
        });
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Between>
        <H2>Edit job</H2>
        <DangerActionButton onClick={onClose}>Close</DangerActionButton>
      </Between>
      <Spacer />
      <Column>
        <Row>
          <label>Job Title</label>
          <TextInput
            value={localJob?.name}
            onInput={(e) => {
              setLocalJob({ ...localJob, name: e.target.value });
            }}
          />
        </Row>
        <Row>
          <label>Description</label>
          <TextInput
            value={localJob?.description}
            onInput={(e) => {
              setLocalJob({ ...localJob, description: e.target.value });
            }}
          />
        </Row>
        <Row>
          <label>Venue</label>
          <Select
            value={localJob?.location?.id}
            onChange={(e) => {
              setLocalJob({
                ...localJob,
                location: locations.find(
                  (location) => location.id === e.target.value
                ),
              });
            }}
          >
            <option
              disabled
              selected={localJob?.location?.id === undefined}
              value=""
            >
              Select a location
            </option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </Row>
        <H3>Shifts</H3>
        <ActionButton
          onClick={() =>
            setLocalJob({
              ...localJob,
              shifts: [
                ...localJob.shifts,
                {
                  id: uuidv4(),
                  startTime: moment(findNextShift(job?.shifts)[0])
                    .tz("Europe/London")
                    .format("YYYY-MM-DD HH:mm:ss"),
                  endTime: moment(findNextShift(job?.shifts)[1])
                    .tz("Europe/London")
                    .format("YYYY-MM-DD HH:mm:ss"),
                  capacity: 1,
                },
              ],
            })
          }
        >
          Add Shift
        </ActionButton>
        {localJob?.shifts?.map((shift) => (
          <Dropdown key={shift.id}>
            <Summary>
              <Between>
                <span>
                  {moment(shift.startTime).format("h:mma")} -{" "}
                  {moment(shift.endTime).format("h:mma")} (
                  {moment(shift.endTime).diff(moment(shift.startTime), "hours")}{" "}
                  hours) ({shift.capacity} volunteers)
                </span>
                <MicroDangerActionButton
                  onClick={() =>
                    setLocalJob({
                      ...localJob,
                      shifts: localJob.shifts.filter((s) => s.id !== shift.id),
                    })
                  }
                >
                  Remove
                </MicroDangerActionButton>
              </Between>
            </Summary>
            <Spacer />
            <Column>
              {/* {JSON.stringify(shift)} */}
              <Row>
                <label>Start Time</label>
                <TextInput
                  type="datetime-local"
                  value={moment(shift.startTime).format("YYYY-MM-DD HH:mm:ss")}
                  onChange={(e) =>
                    setLocalJob({
                      ...localJob,
                      shifts: localJob.shifts.map((s) =>
                        s.id === shift.id
                          ? {
                              ...s,
                              startTime: moment(e.target.value).format(
                                "YYYY-MM-DD HH:mm:ss"
                              ),
                            }
                          : s
                      ),
                    })
                  }
                />
              </Row>
              <Row>
                <label>End Time</label>
                <TextInput
                  type="datetime-local"
                  value={moment(shift.endTime).format("YYYY-MM-DD HH:mm:ss")}
                  onChange={(e) =>
                    setLocalJob({
                      ...localJob,
                      shifts: localJob.shifts.map((s) =>
                        s.id === shift.id
                          ? {
                              ...s,
                              endTime: moment(e.target.value).format(
                                "YYYY-MM-DD HH:mm:ss"
                              ),
                            }
                          : s
                      ),
                    })
                  }
                />
              </Row>
              <Row>
                <label>Capacity</label>
                <TextInput
                  type="number"
                  value={shift.capacity}
                  onChange={(e) =>
                    setLocalJob({
                      ...localJob,
                      shifts: localJob.shifts.map((s) =>
                        s.id === shift.id
                          ? { ...s, capacity: e.target.value }
                          : s
                      ),
                    })
                  }
                />
              </Row>
            </Column>
          </Dropdown>
        ))}
      </Column>
      {/* <Spacer />
      <H3>Restrictions</H3>
      <Spacer />
      <ActionButton
        onClick={() =>
          setLocalJob({
            ...localJob,
            restrictions: [
              ...localJob.restrictions,
              {
                id: uuidv4(),
                name: window.prompt(
                  "Restriction name (e.g. 'Must be over 21')"
                ),
              },
            ],
          })
        }
      >
        Add Restriction
      </ActionButton>
      <Spacer />
      <Column>
        {localJob?.restrictions?.map((restriction) => (
          <Row key={restriction.id}>
            <TextInput
              value={restriction.name}
              onChange={(e) =>
                setLocalJob({
                  ...localJob,
                  restrictions: localJob.restrictions.map((r) =>
                    r.id === restriction.id ? { ...r, name: e.target.value } : r
                  ),
                })
              }
            />
            <DangerActionButton
              style={{ fontSize: 0.8 + "em" }}
              onClick={() =>
                setLocalJob({
                  ...localJob,
                  restrictions: localJob.restrictions.filter(
                    (r) => r.id !== restriction.id
                  ),
                })
              }
            >
              Remove
            </DangerActionButton>
          </Row>
        ))}
      </Column> */}
      <Spacer />
      <ActionButton onClick={() => submitLocalJob()}>Save</ActionButton>
    </Modal>
  );
};

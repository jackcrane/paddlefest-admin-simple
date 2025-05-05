import React, { useEffect, useState } from "react";
import { Modal } from "./components/modal";
import {
  ActionButton,
  Column,
  DangerActionButton,
  H2,
  H3,
  Row,
  Spacer,
  TextInput,
} from "./kit";
import { VolunteerModal } from "./VolunteerModal";
import useFromNow from "./lib/useFromNow";
import moment from "moment";
import EventEmitter from "eventemitter3";
import { Toaster, toast } from "react-hot-toast";
import { Dropdown, Summary, organizeJobsByLocation } from "./ShiftsModal";
import styled from "styled-components";
import { RegistrationChart } from "./components/signupGraph";
import { EditJobModal } from "./EditJobModal";

export const EventHandler = new EventEmitter();
moment.tz.setDefault("GMT");

const P = styled.p`
  margin: 0;
`;

const ProgressBarContainer = styled.div`
  width: 130px;
  height: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
`;
const ProgressBarFill = styled.div`
  width: ${(props) => props.pct}%;
  height: 100%;
  background-color: #007aaf;
`;

const ProgressBar = ({ pct }) => (
  <ProgressBarContainer>
    <ProgressBarFill pct={pct} />
  </ProgressBarContainer>
);

const ENDPOINT = "https://volunteer.jackcrane.rocks";
// const ENDPOINT = "http://localhost:3100";

export default () => {
  const [volunteers, setVolunteers] = useState(null);
  const [jobs, setJobs] = useState(null);

  const [loadedAt, setLoadedAt] = useState(null);
  const fromNow = useFromNow(loadedAt);

  const getVolunteers = () => {
    fetch(`${ENDPOINT}/admin/volunteers`)
      .then((res) => res.json())
      .then((volunteers) => setVolunteers(volunteers))
      .catch((err) =>
        toast.error("Something went wrong fetching volunteers. go yell at jack")
      )
      .finally(() => setLoadedAt(new Date()));
  };

  const getJobs = () => {
    fetch(`${ENDPOINT}/admin/jobs`)
      .then((res) => res.json())
      .then((jobs) => setJobs(jobs))
      .catch((err) =>
        toast.error("Something went wrong fetching jobs. go yell at jack")
      );
  };

  useEffect(() => {
    getVolunteers();
    getJobs();
    EventHandler.on("volunteer:updated", getVolunteers);
    EventHandler.on("volunteer:updated", getJobs);
    EventHandler.on("shift:updated", getVolunteers);
    EventHandler.on("shift:updated", getJobs);
    EventHandler.on("job:updated", getJobs);
  }, []);

  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [query, setQuery] = useState("");
  const filter = (volunteers) => {
    if (query === "") {
      return volunteers;
    }
    return volunteers.filter((volunteer) => {
      return (
        volunteer.name.toLowerCase().includes(query.toLowerCase()) ||
        volunteer.email.toLowerCase().includes(query.toLowerCase()) ||
        volunteer.phone.toLowerCase().includes(query.toLowerCase())
      );
    });
  };

  const isDuplicate = (name) => {
    // see if there is more than one volunteer with the same name
    const names = volunteers.map((v) => v.name);
    return names.filter((n) => n === name).length > 1;
  };

  const [tab, setTab] = useState("volunteer");

  if (volunteers === null || jobs === null) {
    return <p>Loading...........</p>;
  }

  return (
    <>
      <Toaster />
      {tab === "volunteer" ? (
        <>
          <Row>
            <h1>Volunteers</h1>
            <ActionButton onClick={() => setTab("shift")}>Jobs</ActionButton>
          </Row>
          <p>
            Total of {volunteers.length} volunteers, loaded {fromNow}.
          </p>
          <Dropdown>
            <Summary>Registrations per day</Summary>
            <Spacer />
            <RegistrationChart registrations={volunteers} />
          </Dropdown>
          <Spacer />
          <Dropdown>
            <Summary>All emails</Summary>
            <Spacer />
            <p>{volunteers.map((v) => v.email).join(", ")}</p>
          </Dropdown>
          <Spacer height="20px" />
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
                <tr
                  onClick={() => setSelectedVolunteer(volunteer)}
                  key={volunteer.id}
                  style={
                    isDuplicate(volunteer.name)
                      ? {
                          backgroundColor: "rgba(255,0,0,0.05)",
                          outlineColor: "red",
                          outlineWidth: "2px",
                          outlineStyle: "solid",
                        }
                      : {}
                  }
                >
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
        </>
      ) : (
        <>
          <Row>
            <h1>Jobs</h1>
            <ActionButton onClick={() => setTab("volunteer")}>
              Volunteers
            </ActionButton>
          </Row>
          <p>Total of {jobs.length} jobs</p>
          <Spacer />
          <ActionButton onClick={() => setSelectedJob({ shifts: [] })}>
            Create new job
          </ActionButton>
          <Spacer height="20px" />
          <Column>
            {organizeJobsByLocation(jobs).map((location) => (
              <div key={location.id}>
                <Spacer />
                <H2>{location.name}</H2>
                <Column>
                  {location.jobs.map((job) => (
                    <div key={job.id}>
                      <Spacer />
                      <Row style={{ marginBottom: 5 }}>
                        <H3>{job.name}</H3>
                        <P>{location.name}</P>
                        <ActionButton onClick={() => setSelectedJob(job)}>
                          Modify
                        </ActionButton>
                        <DangerActionButton
                          onClick={() => {
                            if (
                              !confirm(
                                "Are you sure you want to delete this job?"
                              )
                            )
                              return;
                            fetch(`${ENDPOINT}/admin/jobs/${job.id}`, {
                              method: "DELETE",
                            })
                              .then((r) => {
                                if (r.status !== 200)
                                  throw new Error("Failed to delete job");
                                toast.success("Job deleted");
                                getJobs();
                              })
                              .catch(() => {
                                toast.error(
                                  "Something went wrong deleting the job"
                                );
                              });
                          }}
                        >
                          Delete
                        </DangerActionButton>
                      </Row>
                      <table>
                        <tr>
                          <th>Start time</th>
                          <th>End time</th>
                          <th>Fill ratio</th>
                          <th>Volunteers</th>
                        </tr>
                        {job.shifts.map((shift) => (
                          <tr style={{ cursor: "initial" }} key={shift.id}>
                            <td>
                              {new moment(shift.startTime)
                                .tz("Europe/London")
                                .subtract(1, "hour")
                                .format("h:mm a")}
                            </td>
                            <td>
                              {new moment(shift.endTime)
                                .tz("Europe/London")
                                .subtract(1, "hour")
                                .format("h:mm a")}
                            </td>
                            <td>
                              <Row>
                                <span>
                                  {shift.volunteers.length} / {shift.capacity} (
                                  {Math.round(
                                    (shift.volunteers.length / shift.capacity) *
                                      100
                                  )}
                                  %)
                                </span>
                                <ProgressBar
                                  pct={Math.round(
                                    (shift.volunteers.length / shift.capacity) *
                                      100
                                  )}
                                />
                              </Row>
                            </td>
                            <td>
                              <Dropdown>
                                <Summary>
                                  {shift.volunteers.length} volunteers
                                </Summary>
                                {shift.volunteers.map((volunteer) => (
                                  <P>
                                    -{" "}
                                    <a
                                      href={`mailto:${volunteer.volunteer.email}`}
                                    >
                                      {volunteer.volunteer.name} [
                                      {volunteer.volunteer.email} /{" "}
                                      {volunteer.volunteer.phone}]
                                    </a>
                                  </P>
                                ))}
                              </Dropdown>
                            </td>
                          </tr>
                        ))}
                      </table>
                    </div>
                  ))}
                </Column>
              </div>
            ))}
          </Column>
        </>
      )}
      <VolunteerModal
        volunteer={selectedVolunteer}
        onClose={() => setSelectedVolunteer(null)}
        isOpen={selectedVolunteer !== null}
      />
      <EditJobModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        isOpen={selectedJob !== null}
        requestRefetch={getJobs}
      />
      <Spacer height="50px" />
    </>
  );
};

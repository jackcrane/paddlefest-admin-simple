import React, { useEffect, useState } from "react";
import {
  ActionButton,
  Between,
  Column,
  DangerActionButton,
  H2,
  H3,
  Hr,
  Popup,
  Row,
  Select,
  ShiftPill,
  Spacer,
  TextInput,
} from "./kit";
import { Modal } from "./components/modal";
import moment from "moment";
import ReactDiffViewer from "react-diff-viewer";
import { getDifferentKeys } from "./lib/object";
import { EventHandler } from "./App";
import { ShiftsModal } from "./ShiftsModal";
import { toast } from "react-hot-toast";

export function transformData(data) {
  const transformedData = [];

  data.forEach((item) => {
    const jobId = item.shift.jobId;
    // See if jobId is already in transformedData
    const jobIndex = transformedData.findIndex((job) => job.jobId === jobId);
    if (jobIndex === -1) {
      // If not, add it
      transformedData.push({
        jobId,
        jobName: item.shift.job.name,
        jobLocation: item.shift.job.location.name,
        shifts: [
          {
            startTime: item.shift.startTime,
            endTime: item.shift.endTime,
          },
        ],
      });
    } else {
      // If so, add the shift to the existing job
      transformedData[jobIndex].shifts.push({
        startTime: item.shift.startTime,
        endTime: item.shift.endTime,
      });
    }
  });
  return transformedData;
}

export const VolunteerModal = ({ volunteer, isOpen, onClose }) => {
  const [localVolunteer, setLocalVolunteer] = useState(volunteer);

  useEffect(() => {
    setLocalVolunteer(volunteer);
  }, [volunteer]);

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

  const [working, setWorking] = useState(false);

  const save = async (sendEmail) => {
    setWorking(true);
    console.log("Saving...");
    console.log(localVolunteer);
    const f = await fetch(
      `https://volunteer.jackcrane.rocks/admin/volunteers/${localVolunteer.id}?sendEmail=${sendEmail}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(localVolunteer),
      }
    );
    console.log(f.status);
    const res = await f.json();
    console.log(res);
    if (f.ok) {
      setLocalVolunteer(res);
      EventHandler.emit("volunteer:updated");
      toast.success("Saved!");
    } else {
      toast.error("Something went wrong. Yell at Jack.");
    }
    setWorking(false);
  };

  const deleteVolunteer = async () => {
    const f = await fetch(
      `https://volunteer.jackcrane.rocks/admin/volunteers/${localVolunteer.id}`,
      {
        method: "DELETE",
      }
    );
    if (f.ok) {
      toast.success("Deleted!");
      onClose();
      EventHandler.emit("volunteer:updated");
    } else {
      toast.error("Something went wrong. Yell at Jack.");
    }
  };

  const [shiftsModalOpen, setShiftsModalOpen] = useState(false);

  if (!volunteer) return null;
  if (!localVolunteer?.name) return null;
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <Between>
          <H2>Edit volunteer</H2>
          <DangerActionButton onClick={onClose}>Close</DangerActionButton>
        </Between>
        <Spacer />
        <Column>
          <Row>
            <label>Name</label>
            <TextInput
              value={localVolunteer?.name}
              onInput={(e) => {
                setLocalVolunteer({ ...localVolunteer, name: e.target.value });
              }}
            />
          </Row>
          <Row>
            <label>Email</label>
            <TextInput
              value={localVolunteer.email}
              onInput={(e) => {
                setLocalVolunteer({ ...localVolunteer, email: e.target.value });
              }}
            />
            <a href="mailto:${localVolunteer.email}">(send email)</a>
          </Row>
          <Row>
            <label>Phone</label>
            <TextInput
              value={localVolunteer.phone}
              onInput={(e) => {
                setLocalVolunteer({ ...localVolunteer, phone: e.target.value });
              }}
            />
            <a href="tel:${localVolunteer.phone}">(call)</a>
          </Row>
          <Row>
            <label>Shirt size</label>
            <Select
              value={localVolunteer.shirtSize}
              onInput={(e) =>
                setLocalVolunteer({
                  ...localVolunteer,
                  shirtSize: e.target.value,
                })
              }
            >
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
              <option value="XXXL">XXXL</option>
            </Select>
          </Row>
          <Row>
            <label>Referral</label>
            <TextInput
              value={localVolunteer.referral}
              onInput={(e) => {
                setLocalVolunteer({
                  ...localVolunteer,
                  referral: e.target.value,
                });
              }}
            />
          </Row>
          <Row>
            <label>
              Registration date/time
              <Popup popup="Registration date/time is set by the server and cannot be edited">
                [RO]
              </Popup>
            </label>
            <TextInput
              disabled
              value={new moment(localVolunteer.createdAt).format(
                "dddd, MMMM Do YYYY, h:mm:ss a"
              )}
            />
          </Row>
          <Row>
            <label>
              Waiver type
              <Popup popup="Waiver type can only be edited by the volunteer ([read only])">
                [RO]
              </Popup>
            </label>
            <TextInput
              disabled
              value={localVolunteer.Waiver[0]?.type || "NOT SIGNED!"}
            />
          </Row>
          <Row>
            <label>Emergency contact name</label>
            <TextInput
              value={
                localVolunteer.Waiver[0]?.emergencyContactName ||
                "WAIVER NOT SIGNED"
              }
              onInput={(e) => {
                setLocalVolunteer({
                  ...localVolunteer,
                  Waiver: [
                    {
                      ...localVolunteer.Waiver[0],
                      emergencyContactName: e.target.value,
                    },
                  ],
                });
              }}
            />
          </Row>
          <Row>
            <label>Emergency contact phone</label>
            <TextInput
              value={
                localVolunteer.Waiver[0]?.emergencyContactPhone ||
                "WAIVER NOT SIGNED"
              }
              onInput={(e) => {
                setLocalVolunteer({
                  ...localVolunteer,
                  Waiver: [
                    {
                      ...localVolunteer.Waiver[0],
                      emergencyContactPhone: e.target.value,
                    },
                  ],
                });
              }}
            />
          </Row>
          <Row>
            <label>Emergency contact email</label>
            <TextInput
              value={
                localVolunteer.Waiver[0]?.emergencyContactEmail ||
                "WAIVER NOT SIGNED"
              }
              onInput={(e) => {
                setLocalVolunteer({
                  ...localVolunteer,
                  Waiver: [
                    {
                      ...localVolunteer.Waiver[0],
                      emergencyContactEmail: e.target.value,
                    },
                  ],
                });
              }}
            />
          </Row>
          <Row>
            <label>Delete Volunteer</label>
            <DangerActionButton
              onClick={() => {
                if (prompt('Are you sure? Type "yes" to confirm') === "yes") {
                  deleteVolunteer();
                }
              }}
            >
              Delete volunteer
            </DangerActionButton>
          </Row>
          <Hr />
          <Row>
            <H3>Shifts</H3>
            <ActionButton onClick={() => setShiftsModalOpen(true)}>
              Edit shifts
            </ActionButton>
          </Row>
          {transformData(volunteer.shifts).map((job) => (
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
          <Hr />
          <H3>Save Changes</H3>
          {!working ? (
            <>
              <ActionButton onClick={() => save(false)}>
                Silently save changes
              </ActionButton>
              <ActionButton onClick={() => save(true)}>
                Save changes and email volunteer
              </ActionButton>
            </>
          ) : (
            <>
              <p>Working...</p>
            </>
          )}
        </Column>

        {/* <code>
        <pre>{JSON.stringify(volunteer, null, 2)}</pre>
      </code> */}
      </Modal>
      <ShiftsModal
        shifts={volunteer.shifts}
        volunteer={volunteer}
        isOpen={shiftsModalOpen}
        onClose={() => setShiftsModalOpen(false)}
      />
    </>
  );
};

/*

{
  "id": "196b6f5f-186e-4bfd-a2a1-fe02907d0518",
  "name": "Michael J Brun",
  "email": "m.j.brun@outlook.com",
  "phone": "513-718-7844",
  "shirtSize": "XXL",
  "referral": "Returning volunteer",
  "createdAt": "2023-06-05T12:07:51.102Z",
  "updatedAt": "2023-06-05T12:07:51.102Z",
  "emailedAt": null,
  "shifts": [
    {
      "id": "ecbe76c1-8cab-4ff8-ac59-1f180575d27b",
      "volunteerId": "196b6f5f-186e-4bfd-a2a1-fe02907d0518",
      "shiftId": "d1485562-fff5-4f6f-9cd8-bfe844188518",
      "shift": {
        "id": "d1485562-fff5-4f6f-9cd8-bfe844188518",
        "startTime": "2020-08-06T10:00:00.000Z",
        "endTime": "2020-08-06T17:00:00.000Z",
        "capacity": 25,
        "jobId": "f9fb04d5-82e5-4ffc-9ab7-2525753e4aca",
        "volunteers": [
          {
            "id": "0ed612c1-e656-4b6f-9e20-74c9badce744",
            "volunteerId": "27d3becb-466e-4165-b463-79d055ad90ca",
            "shiftId": "d1485562-fff5-4f6f-9cd8-bfe844188518"
          },
          {
            "id": "49f2b55b-72f4-4be3-abe6-169b28656d11",
            "volunteerId": "67f7d208-1aab-49d1-963b-65ed9e11fca2",
            "shiftId": "d1485562-fff5-4f6f-9cd8-bfe844188518"
          },
        ],
        "job": {
          "id": "f9fb04d5-82e5-4ffc-9ab7-2525753e4aca",
          "name": "Ham radio operator",
          "description": "Assist with radio communications during Paddlefest. Note: Bryan Hoffman will assign your location after you sign up. ",
          "locationId": "ed369774-2c74-465e-a465-be24d706f5c1",
          "location": {
            "id": "ed369774-2c74-465e-a465-be24d706f5c1",
            "name": "Morning boat launch",
            "address": "Schmidt Field, 2944 Humbert Ave, Cincinnati, OH",
            "slug": "Launch"
          }
        }
      }
    }
  ],
  "Waiver": [
    {
      "id": "f1b56763-c318-483c-9779-7dfd2ddd157c",
      "volunteerId": "196b6f5f-186e-4bfd-a2a1-fe02907d0518",
      "signed": true,
      "signedAt": "2023-06-05T12:07:51.114Z",
      "type": "ADULT",
      "emergencyContactName": "Judy Brun",
      "emergencyContactPhone": "513-322-9432",
      "emergencyContactEmail": "j.m.brun@outlook.com",
      "minor__name": "",
      "minor__parentName": null,
      "minor__DOB": null,
      "minor__guardianEmail": "",
      "adult__name": "Michael J. Brun"
    }
  ]
}

*/

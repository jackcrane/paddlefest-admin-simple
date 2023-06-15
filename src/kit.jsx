import styled from "styled-components";
import React, { useState } from "react";
import { HSLA } from "./lib/color";

export const H2 = styled.h2`
  margin: 0;
`;

export const H3 = styled.h3`
  margin: 0;
`;

export const Between = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Spacer = styled.div`
  height: ${(props) => props.height || "10px"};
  width: ${(props) => props.width || "10px"};
`;

export const ActionButton = styled.button`
  background: ${HSLA("#007aaf", 0.1)};
  color: #007aaf;
  border: 1px solid #007aaf;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 1em;
  cursor: pointer;
  &:hover {
    background: ${HSLA("#007aaf", 0.4)};
  }
`;

export const DangerActionButton = styled(ActionButton)`
  background: ${HSLA("#ff0000", 0.1)};
  color: #ff0000;
  border: 1px solid #ff0000;
  &:hover {
    background: ${HSLA("#ff0000", 0.4)};
  }
`;

export const TextInput = styled.input`
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.8em;
  flex: 1;
  &:focus {
    outline: none;
    border-color: #007aaf;
  }
  &:disabled {
    background: #eee;
    border-style: dashed;
  }
`;

export const Select = styled.select`
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.8em;
  flex: 1;
  &:focus {
    outline: none;
    border-color: #007aaf;
  }
`;

const _Popup = styled.div`
  position: absolute;
  font-weight: normal;
  top: 20;
  left: 0;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.8em;
  z-index: 1000;
  width: 150px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
`;

const _PopupHolder = styled.span`
  position: relative;
`;

const _PopupHover = styled.span`
  cursor: pointer;
  color: ${HSLA("#007aaf", 0.5)};
  font-size: 0.6em;
`;

export const Popup = ({ children, popup }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <_PopupHolder>
      <_PopupHover
        onMouseOver={() => setIsOpen(true)}
        onMouseOut={() => setIsOpen(false)}
      >
        {children}
      </_PopupHover>
      {isOpen && <_Popup>{popup}</_Popup>}
    </_PopupHolder>
  );
};

export const Hr = styled.hr`
  border: 0.5px solid #ccc;
  margin: 10px 0;
`;

export const ShiftPill = styled.div`
  background: ${(props) =>
    props.selected ? HSLA("#007aaf", 0.4) : HSLA("#007aaf", 0.1)};
  color: #007aaf;
  border: 1px solid #007aaf;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.8em;
  /* cursor: pointer;
  &:hover {
    background: ${HSLA("#007aaf", 0.4)};
  } */
`;

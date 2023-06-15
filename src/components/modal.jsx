import React from "react";
import styled from "styled-components";

const _Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 20px;
  z-index: 1000;
  width: 50%;
  height: 70%;
  overflow: auto;
  max-width: 500px;
  /* media queries */
  @media (max-width: 800px) {
    width: 70%;
  }
  @media (max-width: 600px) {
    width: 90%;
    height: 90%;
  }
`;

const _ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  z-index: 1000;
`;

export const Modal = ({ children, isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <>
          <_ModalBackground onClick={onClose} />
          <_Modal>{children}</_Modal>
        </>
      )}
    </>
  );
};

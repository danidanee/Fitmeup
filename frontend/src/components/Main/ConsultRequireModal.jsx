import React, { useState } from "react";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { inject, observer } from "mobx-react";
import Modal from "react-bootstrap/Modal";
import "./Main.scss";

const ConsultRequireModal = ({ setConsult, reset }) => {
  const [show, setShow] = useState(false);
  const user = JSON.parse(window.sessionStorage.getItem("user"));

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const history = useHistory();
  const goMatch = () => {
    history.push("/match");
  };

  return (
    <>
      <div className="btnBox">
        {user && user.type === "stylist" ? (
          <button className="btn" onClick={goMatch}>
            상담 리스트 확인
          </button>
        ) : (
          <button className="btn" onClick={handleShow}>
            실시간 상담 요청
          </button>
        )}
      </div>

      <Modal className="m" show={show} onHide={handleClose} centered>
        <Modal.Header className="mHeader" closeButton></Modal.Header>
        <Modal.Body className="body">
          <div className="mentionTop">스타일리스트에게 상담 받기 위해</div>
          <div className="mentionTop">원하는 서비스를 선택해주세요!</div>
          <div className="mentionBottom">47,505명의 스타일리스트가 활동 중이에요.</div>
          <Link
            className="selectBtn"
            to={user ? `/consult` : `/login`}
            onClick={() => {
              if (user) {
                setConsult("category", "coordi");
                reset();
              } else {
                alert("로그인 후 핏미업 서비스를 이용해보세요!");
                setShow(false);
              }
            }}
          >
            코디 추천 받기
          </Link>
          <Link
            className="selectBtn"
            to={user ? `/consult` : `/login`}
            onClick={() => {
              if (user) {
                setConsult("category", "my");
                reset();
              } else {
                alert("로그인 후 핏미업 서비스를 이용해보세요!");
                setShow(false);
              }
            }}
          >
            내 옷 추천 받기
          </Link>
          <br />
          <br />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default inject(({ consultRequire }) => ({
  setConsult: consultRequire.setConsult,
  reset: consultRequire.reset,
}))(observer(ConsultRequireModal));

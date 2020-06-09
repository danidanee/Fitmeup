import React, { useEffect, useState } from "react";
import "./MyPageMain.scss";
import axios from "axios";
import { Empty } from "antd";
import { Link } from "react-router-dom";

const MyFrequent = () => {
  const [stylistList, setStylistList] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_URL}/user/most_consulting?user_id=` + JSON.parse(window.sessionStorage.getItem("user")).id).then((res) => {
      setStylistList(res.data.stylists);
    });
  }, []);

  return (
    <div className="right_tab">
      <div className="center">
        <h3>
          <b>단골 스타일리스트</b>
        </h3>
      </div>
      {stylistList.length > 0 ? (
        <div className="recentBox">
          {stylistList.map((s) => {
            return (
              <Link to={`/portfolio/detail/${s.stylist_id}`} className="stylist" key={s.stylist_id}>
                <div className="cnt">
                  <b>{s.consult_cnt}</b>회 상담
                </div>
                <div className="stylistBox">
                  <img className="stylistProfile" src="https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/cbdef037365169.573db7853cebb.jpg" alt="profile img" />
                  <div>
                    <div className="name">{s.User.nickname}</div>
                    <div>스타일리스트</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="nothing">
          <Empty description={<span className="description">아직 상담 내역이 없습니다.</span>} />
        </div>
      )}
    </div>
  );
};

export default MyFrequent;

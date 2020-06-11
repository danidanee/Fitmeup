import {
  Consult, ConsultWant, ConsultImage, User, Apply, Review, Portfolio, Payment
} from "../models"
import { Op } from "sequelize"
import sequelize from 'sequelize'

// 상담요청 생성
export const create_consult = (req, res) => {
  try {
    // body로 부터 param 추출
    let { stylist_id, user_id, category, gender, age, top, bottom, want, height, weight, budget, contents,
      start_time, end_time, } = req.body;

    height = height == '' ? null : height;
    weight = weight == '' ? null : weight;
    budget = budget == '' ? null : budget;

    // 특정 대상이 존재할 경우 올바른 대상인지 확인
    if (stylist_id) {
      User.findOne({ where: { id: stylist_id } }).then((user) => {
        if (!user) {
          console.log(
            "consultController.js's create_consult method occurred error. Couldn't find target."
          );
          throw new Error(
            "You select a wrong target. It is a incorrect stylist."
          );
        }
      });
    }
    let appointed = stylist_id ? "true" : "false";
    // 상담 생성
    Consult.create({
      stylist_id: stylist_id,
      user_id: user_id,
      category: category,
      gender: gender,
      age: age,
      top: top,
      bottom: bottom,
      height: height,
      weight: weight,
      budget: budget,
      contents: contents,
      start_time: start_time,
      end_time: end_time,
      appointed: appointed
    }).then(async (consult) => {
      // consult_want 테이블에 want 개수만큼 레코드 생성
      if (want || want.length != 0) {
        for (const w of want) {
          await ConsultWant.create({
            consult_id: consult.dataValues.id,
            val: w.val,
            img: w.img,
          });
        }
      }

      res.json({ result: "Success", consult: consult });
    });
  } catch (err) {
    console.log("consultController.js create_consult method\n ==> " + err);
    res
      .status(500)
      .json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};

// 상담 내용 불러오기
export const read_consult = (req, res) => {
  try {
    // query 추출
    const { consult_id, user_id } = req.query;

    Consult.findOne({
      where: { id: consult_id },
      include: [
        { model: ConsultImage, },
        { model: ConsultWant, },
        { model: Review, },
      ],
    })
      .then(async (consult) => {
        return consult;
      })
      .then(async (consult) => {
        // 이미 지원한 요청인지 확인 -- temp
        await Apply.findOne({
          where: { consult_id: consult.id, stylist_id: user_id },
        }).then((apply) => {
          consult.dataValues.applied = apply ? "yes" : "no";
        });

        return consult;
      })
      .then(async (consult) => {
        // 요청자 및 요청 대상 유저정보 가져오기
        await User.findOne({ where: { id: consult.user_id } }).then((user) => {
          consult.dataValues.req_user = user.dataValues;
        });
        if (consult.stylist_id) {
          await User.findOne({ where: { id: consult.stylist_id } }).then(
            (user) => {
              consult.dataValues.target_user = user.dataValues;
            }
          );
        }

        return consult;
      })
      .then((consult) => {
        res.json({ result: "Success", consult: consult });
      });
  } catch (err) {
    console.log("consultController.js read_consult method\n ==> " + err);
    res
      .status(500)
      .json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};

// 상담요청 수정
export const update_consult = (req, res) => {
  try {
    // param 추출
    const { consult_id, stylist_id, user_id, category, gender, age, top, bottom, want, height, weight,
      budget, contents, start_time, end_time, } = req.body;

    // 상담 수정
    Consult.update(
      {
        stylist_id: stylist_id, user_id: user_id, category: category, gender: gender, age: age,
        top: top, bottom: bottom, height: height, weight: weight, budget: budget, contents: contents,
        start_time: start_time, end_time: end_time,
      },
      {
        where: { id: consult_id },
      }
    ).then(async () => {
      // consult_want 테이블에서 consult_id에 해당하는 레코드 삭제 후 재생성
      await ConsultWant.destroy({
        where: { consult_id: consult_id },
      }).then(async () => {
        for (const w of want) {
          await ConsultWant.create({
            consult_id: consult_id,
            val: w.val,
            img: w.img,
          });
        }
      });
      res.json({ result: "Success" });
    });
  } catch (err) {
    console.log("consultController.js update_consult method\n ==> " + err);
    res
      .status(500)
      .json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};
// 상담요청 삭제
export const delete_consult = (req, res) => {
  try {
    // param 추출
    const { consult_id, user_id } = req.body;

    Consult.destroy({
      where: { id: consult_id, user_id: user_id },
    }).then(async () => {
      await ConsultWant.destroy({ where: { consult_id: consult_id } });
      await ConsultImage.destroy({ where: { consult_id: consult_id } });
      res.json({ result: "Success" });
    });
  } catch (err) {
    console.log("consultController.js delete_consult method\n ==> " + err);
    res
      .status(500)
      .json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};

// 스타일리스트 지정 없이 요청한 전체 상담리스트
export const read_consults = (req, res) => {
  try {
    // param 추출
    let {
      user_id,
      category_filter,
      date_filter,
      gender_filter,
      apply_filter,
    } = req.body;


    let order = date_filter && date_filter == "oldest" ? "ASC" : "DESC";
    if (!user_id) user_id = null;
    if (!category_filter) category_filter = "entire";
    if (!gender_filter) gender_filter = "entire";
    if (!apply_filter) apply_filter = "entire";

    // 대기중이고 대상이 지정되지 않은 상담요청 불러오기
    Consult.findAll({
      where: { state: "REQUESTED", stylist_id: null },
      order: [["updatedAt", order]],
      include: [
        {
          model: ConsultImage,
        },
        {
          model: ConsultWant,
        },
      ],
    })
      //필터링
      .then(async (consults) => {

        let new_consults = [];
        for (const consult of consults) {
          let flag = true;

          // 카테고리 필터링
          if (category_filter != "entire" && consult.category != category_filter) {
            flag = false;
          }
          if (gender_filter != "entire" && consult.gender != gender_filter) {
            flag = false;
          }
          if (flag) {
            await new_consults.push(consult);
          }
        }

        return new_consults;
      })
      .then(async (consults) => {
        // 유저 정보 불러오기
        for (let consult of consults) {
          await User.findOne({ where: { id: consult.user_id } }).then(
            (user) => {
              if (user) consult.dataValues.req_user = user.dataValues;
            }
          );
        }
        return consults;
      })
      .then(async (consults) => {
        // 해당 상담요청에 내가 지원했는지 여부 확인

        let new_consults = [];
        for (let consult of consults) {

          if (user_id) {
            await Apply.findOne({
              where: { consult_id: consult.id, stylist_id: user_id },
            }).then((apply) => {
              if (apply) {
                consult.dataValues.applied = "yes";
              } else {
                consult.dataValues.applied = "no";
              }
            });
          } else {
            consult.dataValues.applied = "no";
          }

          if (
            apply_filter == "entire" ||
            (apply_filter != "entire" && consult.dataValues.applied == apply_filter)
          ) {
            await new_consults.push(consult);
          }

        }
        return new_consults;
      })
      .then((consults) => {
        res.json({ result: "Success", list: consults });
      });
  } catch (err) {
    console.log("consultController.js read_consults method\n ==> " + err);
    res
      .status(500)
      .json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};

// 내가 상담요청한 목록
export const read_myconsults = async (req, res) => {
  try {
    let { user_id, appointed } = req.query;

    let consults;
    // 일반 상담
    if (appointed === 'true') {
      consults = await Consult.findAll({
        include: [ConsultImage, ConsultWant],
        where: { user_id: user_id, appointed: { [Op.like]: "true" } },
        order :[['createdAt','DESC']]
      })
    } else if (appointed === 'false') {
      consults = await Consult.findAll({
        include: [ConsultImage, ConsultWant],
        where: { user_id: user_id, appointed: { [Op.like]: "false" } },
        order :[['createdAt','DESC']]
      })
    } else {
      {
        consults = await Consult.findAll({
          where: { user_id: user_id, state: { [Op.notLike]: 'DENIED' } },
          order :[['createdAt','DESC']]
        })

      }
    }

    res.json({ result: "Success", list: consults })


  } catch (err) {
    console.log("consultController.js read_myconsults method\n ==> " + err);
    res
      .status(500)
      .json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};

// 상담 검색 -- temp
export const search_consults = (req, res) => {
  try {
    const { option, keyword } = req.query;
    const word = "%" + keyword + "%";
  } catch (err) {
    console.log("consultController.js search_consults method\n ==> " + err);
    res
      .status(500)
      .json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};

// 스타일리스트에게 요청한 상담리스트
export const read_recv_consults = (req, res) => {
  try {
    const { stylist_id } = req.query;
    Consult.findAll({
      where: { stylist_id: stylist_id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: ConsultImage,
        },
        {
          model: ConsultWant,
        },
      ],
    })
      .then(async (consults) => {
        for (const consult of consults) {
          await User.findOne({ where: { id: consult.user_id } }).then(
            (user) => {
              consult.dataValues.req_user = user.dataValues;
            }
          );
        }

        return consults;
      })
      .then((consults) => {
        res.json({ result: "Success", list: consults });
      });
  } catch (err) {
    console.log("consultController.js read_recv_consults method\n ==> " + err);
    res
      .status(500)
      .json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};

// 스타일리스트에게 요청한 상담 수락/거절
export const update_recv_consults = async (req, res) => {
  try {
    const { stylist_id, consult_id, state } = req.body;

    Consult.update(
      {
        state: state,
      },
      {
        where: { id: consult_id, stylist_id: stylist_id },
      }
    ).then(async (consult) => {
      if (consult[0] == 0) {
        res.json({
          result: "Fail",
          detail: "해당 상담이 존재하지 않거나 권한이 없는 요청자입니다",
        });
      } else {
        if (state === 'DENIED') {
          let consult = await Consult.findOne({ where: { id: consult_id }, raw: true });
          let category = consult.category;
          let user_id = consult.user_id;
          let portfolio = await Portfolio.findOne({ where: { stylist_id: stylist_id }, raw: true });
          let amount = category === 'coordi' ? portfolio.coordi_price : portfolio.my_price;
          let payment = await Payment.create({ source: user_id, amount: amount, type: "refund" })
          let user = await User.update({
            credit: sequelize.literal('credit +' + amount)
          }, { where: { id: user_id } })

        }


        res.json({ result: "Success" });
      }
    });
  } catch (err) {
    console.log(
      "consultController.js update_recv_consults method\n ==> " + err
    );
    res
      .status(500)
      .json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};
// 상담요청에 대한 지원생성
export const create_apply = (req, res) => {
  try {
    const { stylist_id, consult_id, contents } = req.body;
    Apply.create({
      stylist_id: stylist_id,
      consult_id: consult_id,
      state: 'REQUESTED',
      contents: contents,
    }).then(() => {
      res.json({ result: "Success" });
    });
  } catch (err) {
    console.log("consultController.js create_apply method\n ==> " + err);
    res
      .status(500)
      .json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};
// 지원리스트
export const read_applies = async (req, res) => {
  try {
    const { user_id } = req.query;

    let consult_apply = await Consult.findAll({
      include: [{
        attributes: ['state'],
        model: Apply,
        where: { stylist_id: user_id },
      }, ConsultImage, ConsultWant]
    })

    for (const c of consult_apply) {
      //state 관리
      let apply_state = c.dataValues.Applies[0].dataValues.state;
      if (apply_state === 'DENIED') {
        c.dataValues.state = 'DENIED';
      }
      let user_id = c.dataValues.user_id;
      let user = await User.findOne({
        where: { id: user_id },
        raw: true
      })
      c.dataValues.req_user = user;
    }
    res.json({ state: "Success", list: consult_apply })
  } catch (err) {
    console.log("consultController.js read_applies method\n ==> " + err);
    res
      .status(500)
      .json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};
// 지원 수정
export const update_apply = async (req, res) => {
  try {
    const { apply_id, contents, state } = req.body;

    let apply_update = await Apply.update(
      { contents: contents, state: state },
      { where: { id: apply_id } },
    )

    // 일반 사용자 수락시 해당 상담 및 지원 처리
    if (state === 'ACCEPTED') {
      let apply = await Apply.findOne({
        where: { id: apply_id },
        raw: true,
      })
      let consult_id = apply.consult_id;
      let stylist_id = apply.stylist_id;


      let consult_update = await Consult.update(
        { state: 'ACCEPTED', stylist_id: stylist_id },
        { where: { id: consult_id } }
      )

      let apply_deny = await Apply.update(
        { state: 'DENIED' },
        { where: { consult_id: consult_id, id: { [Op.ne]: apply_id } } }
      )
    }

    res.json({ result: "Success" });
  } catch (err) {
    console.log("consultController.js update_apply method\n ==> " + err);
    res
      .status(500)
      .json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};
// 지원 삭제
export const delete_apply = (req, res) => {
  try {
    const { user_id, consult_id } = req.body;
    Apply.destroy({
      where: { stylist_id: user_id, consult_id: consult_id },
    }).then(() => {
      res.json({ result: "Success" });
    });
  } catch (err) {
    console.log("consultController.js read_applies method\n ==> " + err);
    res
      .status(500)
      .json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};

// 상담 별 지원 목록
export const apply_in_consult = async (req, res) => {
  try {
    const { consult_id } = req.query;

    let apply_list = await Apply.findAll({
      attributes: ['id', 'stylist_id', 'consult_id', 'contents', 'state', 'user.nickname','user.profile_img'],
      include: [
        {
          attributes: [],
          model: User,
        }
      ],
      where: { consult_id: consult_id },
      order :[['createdAt','DESC']],
      raw: true
    })

    let consult = await Consult.findOne({where:{id : consult_id}, raw:true});
    let stylist_id = consult.stylist_id;


    for (const s of apply_list) {
      // 상담 상태 처리
      if( s.stylist_id === stylist_id){
        if(consult.state === 'COMPLETE'){
          s.state = 'COMPLETE'
        }
      }
      let user_id = s.stylist_id;
      // 최근 리뷰 달기
      let review = await Review.findOne({
        where: { target: user_id },
        order: ['createdAt'],
        limit: 1,
        raw: true
      })
      s.recent_review = review;
      // 포트폴리오 이미지 타이틀 달기 
      let portfolio = await Portfolio.findOne({
        where: { stylist_id: user_id },
        raw: true
      })

      s.portfolio_img = portfolio ? portfolio.main_img : null;
      s.portfolio_title = portfolio ? portfolio.title : null;
      s.coordi_price = portfolio ? portfolio.coordi_price ? portfolio.coordi_price : 0 : 0;
      s.my_price = portfolio ? portfolio.my_price ? portfolio.my_price : 0 : 0;

      //평점 달기, 리뷰 수 달기
      let review_info = await Review.findOne({
        attributes: [
          [sequelize.fn('avg', sequelize.col('score')), 'avg_score'],
          [sequelize.fn('count', sequelize.col('*')), 'review_cnt'],
        ],
        where: { target: user_id },
        group: ['target'],
        raw: true
      })
      let avg_score = review_info ? review_info.avg_score : 0;
      let review_cnt = review_info ? review_info.review_cnt : 0;
      s.avg_score = avg_score;
      s.review_cnt = review_cnt;
      // 상담 수 달기
      let consult_info = await Consult.findOne({
        attributes: [
          [sequelize.fn('count', sequelize.col('*')), 'consult_cnt']
        ],
        where: { stylist_id: user_id },
        group: ['stylist_id'],
        raw: true
      })
      let consult_cnt = consult_info ? consult_info.consult_cnt : 0;
      s.consult_cnt = consult_cnt;
    }

    res.json({ result: "Success", list: apply_list })
  } catch (err) {
    
    console.log("consultController.js apply_in_consult method\n ==> " + err);
    res.status(500).json({ result: "Fail", detail: "500 Internal Server Error" });
  }
};
// 상담 완료
export const consult_complete = async (req, res) => {
  try {

    const { consult_id } = req.query;
    let consult_complete = await Consult.update(
      { state: "COMPLETE" },
      { where: { id: consult_id } }
    )
    let consult = await Consult.findOne({ where: { id: consult_id }, raw: true });
    let category = consult.category;
    let user_id = consult.user_id;
    let stylist_id = consult.stylist_id;
    let portfolio = await Portfolio.findOne({ where: { stylist_id: stylist_id }, raw: true });
    let amount = category === 'coordi' ? portfolio.coordi_price : portfolio.my_price;
    let payment = await Payment.create({ source: stylist_id, target: user_id, amount: amount, type: "income" })
    let user = await User.update({
      credit: sequelize.literal('credit +' + amount)
    }, { where: { id: stylist_id } })

    res.json({ result: "Success" })
  } catch (err) {
    console.log("consultController.js consult_complete method\n ==> " + err);
    res.status(500).json({ result: "Fail", detail: "500 Internal Server Error" });
  }
}

// 해당 스타일리스트의 정보
export const stylist_info = async (req, res) => {
  try {

    const { consult_id } = req.query;

    let consult = await Consult.findOne({
      where: { id: consult_id },
      raw: true
    })


    let user_id = consult.stylist_id;
    let user_info = await User.findOne({
      where: { id: user_id },
      raw: true
    })

    user_info.state = consult.state;
    // 최근 리뷰 달기
    let review = await Review.findOne({
      where: { target: user_id },
      order: ['createdAt'],
      limit: 1,
      raw: true
    })
    user_info.recent_review = review;
    // 포트폴리오 이미지 타이틀 달기 
    let portfolio = await Portfolio.findOne({
      where: { stylist_id: user_id },
      raw: true
    })

    user_info.portfolio_img = portfolio ? portfolio.main_img : null;
    user_info.portfolio_title = portfolio ? portfolio.title : null;
    user_info.coordi_price = portfolio ? portfolio.coordi_price ? portfolio.coordi_price : 0 : 0;
    user_info.my_price = portfolio ? portfolio.my_price ? portfolio.my_price : 0 : 0;

    //평점 달기, 리뷰 수 달기
    let review_info = await Review.findOne({
      attributes: [
        [sequelize.fn('avg', sequelize.col('score')), 'avg_score'],
        [sequelize.fn('count', sequelize.col('*')), 'review_cnt'],
      ],
      where: { target: user_id },
      group: ['target'],
      raw: true
    })
    let avg_score = review_info ? review_info.avg_score : 0;
    let review_cnt = review_info ? review_info.review_cnt : 0;
    user_info.avg_score = avg_score;
    user_info.review_cnt = review_cnt;
    // 상담 수 달기
    let consult_info = await Consult.findOne({
      attributes: [
        [sequelize.fn('count', sequelize.col('*')), 'consult_cnt']
      ],
      where: { stylist_id: user_id },
      group: ['stylist_id'],
      raw: true
    })

    let consult_cnt = consult_info ? consult_info.consult_cnt : 0;
    user_info.consult_cnt = consult_cnt;
    res.json({
      result: "Success", list: [user_info]
    })
  } catch (err) {
    console.log("consultController.js stylist_info method\n ==> " + err);
    res.status(500).json({ result: "Fail", detail: "500 Internal Server Error" });
  }

}

// 리뷰 작성을 위한 상담 리스트
export const consult_for_review = async (req, res) => {
  try {

    const { user_id } = req.query;

    let consult_list = await Consult.findAll({
      include: [ConsultWant],
      where: { user_id: user_id, state: { [Op.like]: "COMPLETE" } },
      order : [['createdAt','DESC']]
    })

    // 리뷰 작성 여부
    for (const consult of consult_list) {
      let consult_id = consult.dataValues.id;
      let stylist_id = consult.dataValues.stylist_id;
      // 스타일리스트 정보
      let stylist = await User.findOne({ where: { id: stylist_id }, raw: true })
      consult.dataValues.stylist = stylist;
      // 리뷰 달기
      let review = await Review.findOne({
        where: { consult_id: consult_id, user_id: user_id }
      })
      // 비용 달기
      let category = consult.dataValues.category;
      let portfolio = await Portfolio.findOne({
        where: { stylist_id: stylist_id },
        raw: true
      })
      let price = category === 'coordi' ? portfolio.coordi_price : portfolio.my_price;

      consult.dataValues.price = price;
      consult.dataValues.review = review;
    }

    res.json({ result: "Success", list: consult_list })
  } catch (err) {
    console.log("consultController.js consult_for_review method\n ==> " + err);
    res.status(500).json({ result: "Fail", detail: "500 Internal Server Error" });
  }

}

// 일반 사용자 상담 집계
export const count_user = async (req, res) => {
  try {

    const { user_id } = req.query;
    //상담
    let query = "select count(if(state like 'REQUESTED', 1, null)) requested_cnt,\
    count(if(state like 'ACCEPTED', 1, null)) accepted_cnt,\
    count(if(state like 'COMPLETE', 1, null)) complete_cnt\
    from consult where user_id = :user_id;";
    let count_info = await Consult.sequelize.query(query, {
      replacements: { user_id: user_id },
      type: sequelize.QueryTypes.SELECT
    })
    
    
    query = "select count(*) apply_cnt from apply where consult_id in\
    (select id from consult where user_id =:user_id and state like 'REQUESTED');"
    
    let apply_info = await Consult.sequelize.query(query, {
      replacements: { user_id: user_id },
      type: sequelize.QueryTypes.SELECT
    })
    count_info[0].apply_cnt = apply_info[0].apply_cnt;

    res.json({ result: "Success", info: count_info[0] })
  } catch (err) {
    console.log("consultController.js count method\n ==> " + err);
    res.status(500).json({ result: "Fail", detail: "500 Internal Server Error" });
  }
}

// 스타일리스트 상담 집계
export const count_stylist = async (req, res) => {
  try {
    const { user_id } = req.query;
    //상담
    let query = "select count(if(state like 'REQUESTED', 1, null)) requested_cnt,\
    count(if(state like 'ACCEPTED', 1, null)) accepted_cnt,\
    count(if(state like 'COMPLETE', 1, null)) complete_cnt\
    from consult where stylist_id = :user_id;";
    let count_info = await Consult.sequelize.query(query, {
      replacements: { user_id: user_id },
      type: sequelize.QueryTypes.SELECT
    })
    
    query = "select count(*) apply_cnt from apply where stylist_id=:user_id\
              and state like 'REQUESTED'";
    
    let apply_info = await Consult.sequelize.query(query, {
      replacements: { user_id: user_id },
      type: sequelize.QueryTypes.SELECT
    })
    
    count_info[0].apply_cnt = apply_info[0].apply_cnt;

    res.json({ result: "Success", info: count_info[0] })
  } catch (err) {
    console.log("consultController.js count method\n ==> " + err);
    res.status(500).json({ result: "Fail", detail: "500 Internal Server Error" });
  }
}
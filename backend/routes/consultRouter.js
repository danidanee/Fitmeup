import express from "express"
const consultRouter = express.Router();

let consult = require('../controllers/consultController')

consultRouter.post("/req", consult.create_consult);
consultRouter.get("/req", consult.read_consult);
consultRouter.put("/req", consult.update_consult);
consultRouter.delete("/req", consult.delete_consult);

consultRouter.post("/reqlist", consult.read_consults);
consultRouter.get("/myreqlist", consult.read_myconsults);

consultRouter.get("/reqsearch", consult.search_consults);
consultRouter.get("/recvlist", consult.read_recv_consults);

consultRouter.put("/recv_confirm", consult.update_recv_consults);
consultRouter.post("/apply", consult.create_apply);
consultRouter.get("/apply", consult.read_applies);
consultRouter.put("/apply", consult.update_apply);
consultRouter.delete("/apply", consult.delete_apply);

consultRouter.get("/apply_in_consult", consult.apply_in_consult);
consultRouter.get("/complete", consult.consult_complete);

consultRouter.get("/stylist_info", consult.stylist_info);
consultRouter.get("/list_for_review", consult.consult_for_review);

consultRouter.get("/count_user", consult.count_user);
consultRouter.get("/count_stylist", consult.count_stylist);
export default consultRouter;
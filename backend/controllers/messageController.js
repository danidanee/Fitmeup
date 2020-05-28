import { message, user } from '../models'

export const get_received_list = async function(req, res) {
    try {
        const { id } = req.query;
        const message_list = await message.findAll({
            where: {
                target: id
            }
        })

        let unread_count = 0
        for (const m of message_list) {
            m.source = await remove_user_useless_field(await get_user(m.source))
            m.target = await remove_user_useless_field(await get_user(m.target))
            if(!m.readed) unread_count++
        }


        return res.status(200).json({
            result: "Success",
            messages: message_list,
            unread_count: unread_count
        })
    } catch(err) {
        console.log(err);
        return res.status(500).json({
            result: "Fail",
            detail: "500 Internal Server Error"
        })
    }
}

export const get_sent_list = async function(req, res) {
    try {
        const { id } = req.query;
        const message_list = await message.findAll({
            where: {
                source: id
            }
        })

        let unread_count = 0
        for (const m of message_list) {
            m.source = await remove_user_useless_field(await get_user(m.source))
            m.target = await remove_user_useless_field(await get_user(m.target))
            if(!m.readed) unread_count++
        }

        return res.status(200).json({
            result: "Success",
            messages: message_list,
            unread_count: unread_count
        })
    } catch(err) {
        console.log(err);
        return res.status(500).json({
            result: "Fail",
            detail: "500 Internal Server Error"
        })
    }
}

export const get_detail = async function(req, res) {
    try {
        const { mid } = req.query;

        const detail = await message.update({readed: 1}, {
            where: {
                id : mid
            }
        })

        const m = await message.findOne({
            where: {
                id: mid
            }
        })

        m.source = await remove_user_useless_field(await get_user(m.source))
        m.target = await remove_user_useless_field(await get_user(m.target))

        return res.status(200).json({
            result: "Success",
            message: m
        })
    } catch(err) {
        console.log(err);
        return res.status(500).json({
            result: "Fail",
            detail: "500 Internal Server Error"
        })
    }
}

export const send_message = async function(req, res) {
     try {
         const { source, target, contents } = req.body
         const new_message = await message.create({source, target, contents})

         if(new_message) {
             return res.status(200).json({
                 result: "Success",
                 message: new_message
             })
         } else {
             return res.status(500).json({
                 result: "Fail"
             })
         }

     } catch (err) {
         console.log(err)
         return res.status(500).json({
             result: "Fail",
             detail: "500 Internal Server Error"
         })
     }

}

const get_user = async function(uid) {
    const result = await user.findOne({
        where: {
            id: uid
        }
    })
    return result;
}

const remove_user_useless_field = async function(user) {
    return {id: user.id, nickname: user.nickname, name: user.name, profile_img: user.profile_img}
}
const UPR = require ('../models/UPR.js');
const User = require('../models/user.js');
const Postage = require ('../models/postage.js');
const { search } = require('../routes.js');

module.exports = {

    async create_report (req, res){
        const upr = await UPR.create(req.body);
        return res.status(200).json(upr);
    },

    async list_all (req, res){
        const upr = await UPR.find();
        return res.json(upr);
    }, 

    async delete_all (req, res){
        const upr = await UPR.deleteMany({})
        return res.send(upr);
    },

    async report_postage (req, res, next){   
        
        try{
            console.log("Reporting Postage...")
            
            const array_reports = await UPR.find({fk_user_id: req.body.user_id, fk_postage_id: req.body.postage_id})

            if(array_reports.length < 1){

                await UPR.create({fk_user_id: req.body.user_id, fk_postage_id: req.body.postage_id})

                console.log("New report successfully created!\n")
            }
            else{
                console.log("Error, to much reports created!\n" + "\n-----\n")
                return res.status(400).send({error_report_postage: "To much reports created with this parameters"});
            }

            return next()
        }catch(err){
            return res.status(400).send({error_report_postage: err.message});
        }
    },

    async postage_report_number_alteration (req, res) {
        try{
            console.log("Reporting this postage...")

            const array_report = await Postage.find({fk_user_id: req.body.user_id, fk_postage_id: req.body.postage_id})

            if(array_report.length > 1){
                console.log("Error, To much reports created with this parameters\n" + "\n-----\n")
                return res.status(400).send({error_post_report_number_alteration: "To much reports created with this parameters"});
            }

            const postage_related_reports = await Postage.findById(req.body.postage_id)
            var postage_reports_number = postage_related_reports.post_reports

            if(array_report.length <= 3){
                postage_reports_number += 1
            }
            else{
                Postage.findById(req.body.postage_id).fk_user_id = null
                req.postage.save()
                console.log("Report successfully done!\n" + "\n-----\n")
                return res.status(200).send("Postagem " + postage_related_reports.post_title + " excluída devido a repetidos reports!");
            }

            postage_related_reports.post_reports = postage_reports_number
            await postage_related_reports.update({post_reports: postage_related_reports.post_reports});

            console.log("Report successfully done!\n" + "\n-----\n")
            return res.status(200).send("Denuncia da postagem " + postage_related_reports.post_title + " feita com sucesso!");

        }catch(err){
            return res.status(400).send({error_post_reports_alteration: err.message});
        }
    }
}
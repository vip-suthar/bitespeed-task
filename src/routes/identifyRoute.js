const router = require('express').Router();
const { Sequelize, Op } = require('sequelize');
const sql_conn = require('../services/dbService');

const joinChains = async (ch1, ch2, { sequelize, models }) => {
    let primaryIdCh1 = ch1.linkedId || ch1.id,
        primaryIdCh2 = ch2.linkedId || ch2.id;

    if (primaryIdCh1 === primaryIdCh2) return;
    else {
        let primaryNodeCh1 = ch1,
            primaryNodeCh2 = ch2;

        if (primaryNodeCh1.linkPrecedence === "secondary") {
            primaryNodeCh1 = await models.Contact.findByPk(primaryIdCh1, { raw: true });
        }

        if (primaryNodeCh2.linkPrecedence === "secondary") {
            primaryNodeCh2 = await models.Contact.findByPk(primaryIdCh2, { raw: true });
        }

        if (primaryNodeCh1.createdAt < primaryNodeCh2.createdAt) {

            await models.Contact.update(
                {
                    linkedId: primaryIdCh1,
                    linkPrecedence: "secondary",
                    updatedAt: Sequelize.literal("CURRENT_TIMESTAMP")
                }, {
                where: {
                    [Op.or]: [
                        { id: primaryIdCh2 },
                        { linkedId: primaryIdCh2 }
                    ]
                }
            })
        } else {
            await models.Contact.update(
                {
                    linkedId: primaryIdCh2,
                    linkPrecedence: "secondary",
                    updatedAt: Sequelize.literal("CURRENT_TIMESTAMP")
                }, {
                where: {
                    [Op.or]: [
                        { id: primaryIdCh1 },
                        { linkedId: primaryIdCh1 }
                    ]
                }
            })
        }
    }
}

const processInput = async ({ email, phoneNumber, sequelize, models }) => {

    let foundContact = await models.Contact.findOne({
        where: { [Op.or]: [{ email }, { phoneNumber }] },
        raw: true
    });

    if (!foundContact) {
        await models.Contact.create({
            email,
            phoneNumber
        });
        return;
    }

    let searchParam = {};

    if ((foundContact.email === email) && (foundContact.phoneNumber === phoneNumber)) {
        return;
    } else if (foundContact.email === email) {
        if (!phoneNumber) return;
        searchParam.phoneNumber = phoneNumber;
    } else if (foundContact.phoneNumber === phoneNumber) {
        if (!email) return;
        searchParam.email = email;
    }

    let foundContactByParam = await models.Contact.findOne({
        where: searchParam,
        raw: true
    });

    if (!foundContactByParam) {
        await models.Contact.create({
            email,
            phoneNumber,
            linkedId: foundContact.linkedId || foundContact.id,
            linkPrecedence: "secondary"
        });
    } else {
        await joinChains(foundContact, foundContactByParam, { sequelize, models });
    }
}

const prepareResponse = async ({ email, phoneNumber, sequelize, models }) => {
    let primaryContact = await models.Contact.findOne({
        where: { [Op.or]: [{ email }, { phoneNumber }] },
        raw: true
    });

    if (primaryContact.linkPrecedence !== "primary") {
        primaryContact = await models.Contact.findByPk(primaryContact.linkedId, { raw: true });
    }

    const response = {
        "contact": {
            "primaryContatctId": primaryContact.id,
            "emails": [],
            "phoneNumbers": [],
            "secondaryContactIds": []
        }
    };
    const emailSet = new Set([primaryContact.email]);
    const phoneNumberSet = new Set([primaryContact.phoneNumber]);

    let secondaryContacts = await models.Contact.findAll({
        where: { linkedId: primaryContact.id },
        raw: true
    });

    secondaryContacts.forEach((contact) => {
        emailSet.add(contact.email);
        phoneNumberSet.add(contact.phoneNumber);
        response.contact.secondaryContactIds.push(contact.id);
    });

    response.contact.emails.push(...emailSet.values());
    response.contact.phoneNumbers.push(...phoneNumberSet.values());

    return response;
}

router.post("/identify", async (req, res) => {

    const { sequelize, models } = await sql_conn;
    if (!sequelize) {
        return res.status(500).send("Some Error Occured");
    }

    let { email, phoneNumber } = req.body;


    if (!(email || phoneNumber)) {
        return res.status(500).send("Atleast one of `phoneNumber` or `email` should be present");
    }

    await processInput({ email, phoneNumber, sequelize, models });

    const response = await prepareResponse({ email, phoneNumber, sequelize, models })
    res.send(response);
});

module.exports = router;
const nodemailer = require('nodemailer')

const emailProps = async (email, res) => {
  let account = await nodemailer.createTestAccount()

  let transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 465,
    secure: true,
    auth: {
      user: 'apikey',
      pass: process.env.MAILKEY
    }
  })

  // setup email data with unicode symbols
  let mailOptions = {
    from: email + '@gmail.com', // sender address
    to: email + '@gmail.com', // list of receivers
    subject: 'properties list', // Subject line
    text: JSON.stringify(res), // plain text body
    html: `<b>${JSON.stringify(res, undefined, 2)}</b>` // html body
  }

  let info = await transporter.sendMail(mailOptions)

  console.log('Message sent: %s', info.messageId)
  // Preview only available when sending through an Ethereal account
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = emailProps

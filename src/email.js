const nodemailer = require('nodemailer')

const emailProps = async (email = 'test', res) => {
  let account = await nodemailer.createTestAccount()
  let transporter
  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net', // <-- real smtp server
      port: 465,
      secure: true,
      auth: {
        user: 'apikey',
        pass: process.env.MAILKEY
      }
    })
  } else {
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email', // <-- test smtp server
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass
      }
    })
  }

  const html = `
  <h3>🏠🤖 Propito property list 🤖🏠</h3>
  <div>${res
    .map(
      entry =>
        `<ul style='background-color: #cdfbff;
        border-radius: 10px;
        padding: 20px;
        list-style: none;'>${Object.keys(entry)
    .map((prop, i, arr) => `<li>${JSON.stringify(entry[prop])}</li>`)
    .join('')}</ul>`
    )
    .join()}</div>`

  let mailOptions = {
    from: 'Propito <<propito@sendgrid.net>>', // sender address
    to: email + '@gmail.com', // list of receivers
    subject: `Propito Daily Properties List ${new Date().toLocaleDateString()}`, // Subject line
    text: JSON.stringify(res), // plain text body
    html // html body
  }

  let info = await transporter.sendMail(mailOptions)
  if (process.env.NODE_ENV === 'development') {
    console.log('Message sent: %s', info.messageId)
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  }
}

module.exports = emailProps

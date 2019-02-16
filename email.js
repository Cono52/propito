const nodemailer = require('nodemailer')

const emailProps = async (email = 'test', res) => {
  let account = await nodemailer.createTestAccount()

  let transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net', // <-- real smtp server
    port: 465,
    secure: true,
    auth: {
      user: 'apikey',
      pass: process.env.MAILKEY
    }
    // host: 'smtp.ethereal.email', // <-- test smtp server
    // port: 587,
    // secure: false,
    // auth: {
    //   user: account.user,
    //   pass: account.pass
    // }
  })

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
    from: 'propito@sendgrid.net', // sender address
    to: email + '@gmail.com', // list of receivers
    subject: `Propito Daily Properties List ${new Date().toLocaleDateString()}`, // Subject line
    text: JSON.stringify(res), // plain text body
    html // html body
  }

  let info = await transporter.sendMail(mailOptions)

  console.log('Message sent: %s', info.messageId)
  // Preview only available when sending through an Ethereal account
  // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
}

module.exports = emailProps

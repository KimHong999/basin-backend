import "dotenv/config";
import nodemailer from "nodemailer";
import Email from "email-templates";
// TODO: Fix
// import Configuration from "~/app/models/Configuration";

const isLocal = process.env.APP_ENV !== "production";
class Mailer {
  constructor(args: any) {
    //@ts-ignore
    this.subject = args.subject || "";
    //@ts-ignore
    this.receiver = args.receiver || "";
  }

  config = async () => {
    // const setting = (await Configuration.query().first()) as any;
    // let setting: any = {}
    // const emailConfig = setting.email_config;
    return {
      host: process.env.HOST,
      port: process.env.EMAIL_PORT,
      tls: true,
      ssl: true,
      secure: true,
      auth: {
        sender: process.env.SENDER_EMAIL,
        user: process.env.USERNAME,
        pass: process.env.PASSWORD,
      },
    };
  };

  send = async (template: any) => {
    try {
      const config = (await this.config()) as any;
      if (!config?.auth?.user) {
        console.log(`Oop, sorry something wrong with mailer configuration`);
        return;
      }
      if (!isLocal) {
        const transporter = nodemailer.createTransport(config);
        await transporter.sendMail({
          from: config.auth.sender,
          //@ts-ignore
          to: this.receiver,
          //@ts-ignore
          subject: this.subject,
          html: template,
        });
      } else {
        const email = new Email({
          views: { root: template },
          preview: false,
        });
        await email.send({
          message: {
            from: config.auth.sender,
            //@ts-ignore
            to: this.receiver,
            //@ts-ignore
            subject: this.subject,
            html: template,
          },
        });
      }
    } catch (err: any) {
      console.log(`Oop, something went wrong with sending email.`);
      console.log(err);
    }
  };
}

export default Mailer;

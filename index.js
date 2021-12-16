const { App } = require('@slack/bolt');
const { ConsoleLogger, LogLevel } = require('@slack/logger');
const HttpsProxyAgent = require('https-proxy-agent');

const logger = new ConsoleLogger();
logger.setName('practicebot:');
logger.setLevel(LogLevel.INFO);

const options = {
  logLevel: LogLevel.DEBUG,
  socketMode: true,
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN
};

const proxy = process.env.http_proxy;
if (typeof proxy === 'undefined') {
  logger.info('Proxy is not set');
} else {
  logger.info('Proxy is ' + proxy);
  const agent = new HttpsProxyAgent(proxy);
  options.agent = agent;
}

const app = new App(options);

app.shortcut('global-shortcut', async ({ ack, body, client }) => {
  await ack();
  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'modal-id',
      title: {
        type: 'plain_text',
        text: 'タスク登録'
      },
      submit: {
        type: 'plain_text',
        text: '送信'
      },
      close: {
        type: 'plain_text',
        text: 'キャンセル'
      },
      blocks: [
        {
          type: 'input',
          block_id: 'input-task',
          element: {
            type: 'plain_text_input',
            action_id: 'input',
            multiline: true,
            placeholder: {
              type: 'plain_text',
              text: 'タスクの詳細・期限などを書いてください'
            }
          },
          label: {
            type: 'plain_text',
            text: 'タスク'
          }
        }
      ]
    }
  });
});

app.view('modal-id', async ({ ack, view, logger }) => {
  logger.info(`Submitted data: ${JSON.stringify(view.state.values)}`);
  await ack();
});

app.message('こんにちは', async ({ message, say }) => {
  await say(`:wave: こんにちは <@${message.user}>`);
});

(async () => {
  await app.start();
  logger.info('PracticeBot started');
})();

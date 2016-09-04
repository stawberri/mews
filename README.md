# mews
trust your output to a mews

[![NPM](https://nodei.co/npm/mews.png?mini=true)](https://nodei.co/npm/mews/)
[![Build Status](https://travis-ci.org/stawberri/mews.svg?branch=master)](https://travis-ci.org/stawberri/mews)

mews are intended to make sending messages on [Slack](#slack), [Telegram](#telegram), and [Twitter](#twitter) as easy as using `console.log`.

```js
const mews = require('mews')
let mew = mews.telegram(apiToken, chatID)

mew(`Warning: ${name} is a cutie!`)
```

[More information about supported services](#log) is available below.

## Using mews
This package is a collection of mews (though I've actually only written two so far). You start by plucking the mew that you want to use off of the mews module:

```js
let mew = mews.telegram
// continued below
```

Now that you have a mew, you need to pass it configuration arguments. These are usually pesky (but important) required details like API keys and an identifiers for your recipients. mews are functions, so you just call them as you would any other function.

```js
// continued from above
mew = mew(apiToken, chatID)
// continued below
```

At this point, your mew becomes a complete, fully grown mew. Complete mews work exactly like `console.log` does for your program output, which means that you can pass it multiple arguments, objects, or even [format strings](https://nodejs.org/api/util.html#util_util_format_format)!

```js
// continued from above
mew('%s: Found %d new cuties!', Date(), count)
```


### Building mews
Each mew is actually a curried function. Officially, [curried functions](https://en.wikipedia.org/wiki/Currying) are weird monstrosities made of lots of little functions, but as far as we're concerned, they're just really lenient functions that are okay with not getting enough arguments. Where most functions will kick and scream at you, these just give you new functions that remember the arguments you've already provided.

A freshly plucked mew will first take in all the configuration arguments it needs (across multiple calls, if necessary), and if there are any left over, the rest will be treated as output. After that happens, you'll just keep getting back additional complete mews that treat all their arguments as output.

These are all valid ways to send the same message over Telegram:

```js
let mew = mews.telegram(apiToken, chatID, 'Nyan~')
```

```js
let mew = mews.telegram(apiToken)
mew = mew(chatID, 'Nyan~')
```

```js
let mew = mews.telegram(apiToken)
mew = mew(chatID)
mew('Nyan~')
```

While that last one may seem a*mews*ingly verbose, it still has its uses! For example, if you wanted to send notifications to *two* people using the same bot, you might do something like this:

```js
let telegramFor = mews.telegram(apiToken)
let myMew = telegramFor(myself)
let friendMew = telegramFor(myFriend)

myMew('Reminder: Buy more pudding.')
friendMew("Hey there, cutie~ How are you today?")
```


### Configuring mews
If you want to do more complicated things, mews are also configurable. For example, the `log` mew usually outputs messages to STDOUT, but you can use the `.err` simple property to switch over to STDERR:

```js
let mew = mews.log
mew.err("Error error! Time to panic nyow!")
```

Properties can go anywhere. Simple properties like `.err` simply return a new mew. You generally wouldn't use a simple property multiple times, but this is completely valid:

```js
let mew = mews.telegram.noNotify // noNotify on
mew = mew.noNotify(apiToken) // noNotify off
mew = mew(chatID).noNotify // noNotify on
mew("Psst! You won't get notified about this message.")
```

Complex properties are a little scarier, since they *modify* your *current* mew.

```js
let mew = mews.telegram(apiToken, chatID)
mew.reply_markup = JSON.stringify({force_reply: true})
mew(`"Meow" you're in reply mode!`)
```

It's okay, though, because if you use them as simple properties, they'll *usually* give you a new mew with that setting reset to default.

```js
let mew = mews.telegram(apiToken, chatID)
mew.reply_markup = 'Oh no! This is invalid!'
mew = mew.reply_markup
mew('I fixed it!')
```

If all this configuration stuff is too confusing, don't worry about it! You can use mews without worrying about configuring anything at all. Most of the time they're just there for completeness.

## Log
Please note that this and all other mews are curried functions, as stated above. Calls always return a partially applied mew remembering provided arguments other than the ones in `...output`.

```js
mew = mews.log(...output)
```
Proof of concept mew that just calls `console.log`.

* `...output` Desired output.

### Configuration
* `mew.err` *toggle*. Print output to STDERR instead of STDOUT.
* `mew.error` *alias*. `mew.err`

```js
let mew = mews.log
mew('Normal log message') // STDOUT
mew.err('Error message') // STDERR
```

## Slack
```js
mew = mews.slack(apiToken, details, ...output)
```
Sends a message over Slack. The simplest way to use this is simply providing a channel name as `details`.

* `apiToken` *string*. A Slack API token. Only tested with the ones provided by [Slack Bots](https://my.slack.com/apps/A0F7YS25R-bots), but any other Slack API Token will probably work too.
* `details` This can be an object or string.
  - *string*. A shortcut for setting the `channel` property below.
  - *object*. The only required property is `channel`. See below for interactions between properties.
    - `channel` *string*. The channel you would like to send your message to. Include a `@` before usernames to send a DM. You may optionally include a `#` before channel names. This is required.
    - `name` *string*. A sender name for your message.
    - `icon` *string*. A url to an image file to be used as your message's icon.
    - `emoji` *string*. A Slack emoji to be used as your message's icon. Colons are required.
* `...output` Desired output.

Providing a string as `details` is equivalent to providing an object with only a `channel` property. If you do this, your bot (or whatever entity your API token corresponds to) must be in the channel specified. If you specify any of the other properties, this is *not* required.

### Configuration
* `mew.noParse` *toggle*. *Disables* the `full` parse mode. This allows you to use [Slack's formatting spec](https://api.slack.com/docs/message-formatting).
* `mew.link_names` *toggle*. Enables channel and username auto-linking. This is only useful when used with `noParse`, because the `full` parse mode does this by default.
* `mew.attachments = ''` *string*. A json string following [Slack's attachment spec](https://api.slack.com/docs/message-attachments).
* `mew.noPreview` *toggle*. Disables all link previews.

```js
let mewWithToken = mews.slack(apiToken)
let mew = mewWithToken(channel)
mew('This is a normal, fully parsed message that shows link previews.')
mew.noParse('<https://api.slack.com/docs/message-formatting|This syntax> is difficult to use.')

mew = mewWithToken({channel, name: 'Yummy', emoji: ':strawberry:'})
mew('My name is Yummy and I have a strawberry as an icon.')
```

## Telegram
```js
mew = mews.telegram(botToken, chatID, ...output)
```
Send a message to the account with `chatID` from the bot with given `botToken`. Requires the recipient to have messaged the bot at least once.

* `botToken` *string*. Your telegram bot's API token. [BotFather](https://telegram.me/BotFather) will tell give you this when you create a bot or use the `/token` command.
* `chatID` *string*. Your recipient's chat ID, which is usually a positive integer for users, a negative integer for groups, or a name for channels.
* `...output` Desired output.

### Configuration
* `mew.markdown` *toggle*. Switch on markdown parsing mode. Please note that the "markdown" supported by this mode is simplified from normal markdown: `*bold* _italic_`
* `mew.html` *toggle*. Switch on HTML parsing mode, which supports a subset of tags: `<b> <i> <a href=""> <code> <pre>`
* `mew.noPreview` *toggle*. Disable link previews.
* `mew.noNotify` *toggle*. Disable notifications for message.
* `mew.reply_markup = ''` *string*. Configure `reply_markup` request variable, typically for controlling how a user would reply to your message.
* `mew.disable_web_page_preview` *alias*. `mew.noPreview`
* `mew.disable_notification` *alias*. `mew.noNotify`
* `mew.parse_mode = ''` *string*. Actual `parse_mode` variable as sent in request to Telegram. `mew.markdown` and `mew.html` modify this variable for you so you don't have to.

```js
let mew = mews.telegram(botToken, chatID)
let mdn = mew.markdown('[With preview](https://npm.im/nyaa)') // Markdown
mdn.noPreview('[No preview](https://npm.im/mews)') // Markdown & noPreview

let rpy = mdn() // Clone mdn => rpy
rpy.reply_markup = JSON.stringify({force_reply: true}) // Modify rpy
rpy(`_Meow_ you're in reply mode!`) // Markdown & force_reply
```

## Twitter
```js
mew = mews.twitter(consumer_key, consumer_secret, token, token_secret, ...output)
```
Send a tweet on twitter with the provided app and account details. You can grab some from Twitter's [Application Management site](https://apps.twitter.com).

* `consumer_key` *string*. Twitter app consumer key (api key)
* `consumer_secret` *string*. Twitter app consumer secret (api secret)
* `token` *string*. Twitter user access token
* `token_secret` *string*. Twitter user access token secret
* `...output` Desired output.

### Configuration
* `mew.sensitive` *toggle*. Flags your tweet as potentially containing sensitive content.
* `mew.replyTo = ''` *string*. The ID of a tweet you would like to reply to. This doesn't do anything unless your tweet text contains `@username`, where `username` is the username of the account that tweeted the tweet.
* `mew.dm = ''` *string*. If this is set, your message will be sent as a DM to a recipient specified by this value. If this value contains only digits, it will be treated as a user ID. If it contains anything other than digits, it will be considered a username. You must include a `@` before a username that is all digits (to differentiate it from a user id), but it's optional otherwise.
* `mew.in_reply_to_status_id` *alias*. `mew.replyTo`
* `mew.possibly_sensitive` *alias*. `mew.sensitive`

```js
let mew = mews.twitter(cKey, cSecret)
mew = mews.twitter(token, tSecret)

mew('This is a tweet.')
```

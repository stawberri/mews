# mews
trust your output to a mews

[![NPM](https://nodei.co/npm/mews.png?mini=true)](https://nodei.co/npm/mews/)
[![Build Status](https://travis-ci.org/stawberri/mews.svg?branch=master)](https://travis-ci.org/stawberri/mews)

mews are intended to make sending messages over [Telegram](https://telegram.org/) as easy as using `console.log`.

```js
const mews = require('mews')
let mew = mews.telegram(apiToken, chatID)

mew(`Warning: ${name} is a cutie!`)
```

[More information about supported services](#available-mews) is available below.

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

Properties can go anywhere. Simple properties like `.markdown` simply return a new mew. You generally wouldn't use a simple property multiple times, but this is completely valid:

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

If all this configuration stuff is too confusing, don't worry about it! You can use mews without worrying about configuring anything at all.

## Available mews
As stated above, all mews are curried, so function calls always return a partially applied mew remembering provided arguments other than the ones in `...output`.

### mew = mews.log(...output)
Proof of concept mew that just calls `console.log`. May be worth noting that this function is four characters shorter than `console.log`.

* `...output` Desired output.

#### log configuration

* `mew.err` *toggle*. Print output to STDERR instead of STDOUT.
* `mew.error` *alias*. `mew.err`

```js
let mew = mews.log
mew('Normal log message') // STDOUT
mew.err('Error message') // STDERR
```

### mew = mews.telegram(botToken, chatID, ...output)
Send a message to the account with `chatID` from the bot with given `botToken`. Requires the recipient to have messaged the bot at least once.

* `botToken` *string*. Your telegram bot's API token. You get this when you create your bot, and can ask BotFather for it again with the `/token` command.
* `chatID` *string*. Your recipient's chat ID, which is usually a positive integer for users, a negative integer for groups, or a name for channels.
* `...output` Desired output.

#### telegram configuration

* `mew.markdown` *toggle*. Switch on markdown parsing mode. Please note that the "markdown" supported by this mode is simplified from normal markdown: `*bold* _italic_`
* `mew.html` *toggle*. Switch on HTML parsing mode, which supports a subset of tags: `<b> <i> <a href=""> <code> <pre>`
* `mew.noPreview` *toggle*. Disable link previews.
* `mew.noNotify` *toggle*. Disable notifications for message.
* `mew.reply_markup =` *string*. Configure `reply_markup` request variable, typically for controlling how a user would reply to your message.
* `mew.disable_web_page_preview` *alias*. `mew.noPreview`
* `mew.disable_notification` *alias*. `mew.noNotify`
* `mew.parse_mode =` *string*. Actual `parse_mode` variable as sent in request to Telegram. `mew.markdown` and `mew.html` modify this variable for you so you don't have to.

```js
let mew = mews.telegram(botToken, chatID)
let mdn = mew.markdown('[With preview](https://npm.im/nyaa)') // Markdown
mdn.noPreview('[No preview](https://npm.im/mews)') // Markdown & noPreview

let rpy = mdn() // Clone mdn => rpy
rpy.reply_markup = JSON.stringify({force_reply: true}) // Modify rpy
rpy(`_Meow_ you're in reply mode!`) // Markdown & force_reply
```

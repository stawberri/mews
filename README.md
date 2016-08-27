# mews
trust your output to a mews

[![NPM](https://nodei.co/npm/mews.png?mini=true)](https://nodei.co/npm/mews/)
[![Build Status](https://travis-ci.org/stawberri/mews.svg?branch=master)](https://travis-ci.org/stawberri/mew)

mews are intended to make sending messages over [Telegram](https://telegram.org/) as easy as using `console.log`.

```js
const mews = require('mews')
let mew = mews.telegram(apiToken, chatID)

mew(`Warning: ${name} is a cutie!`)
```


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
mew('%s: Detected %d new cuties!', Date(), cutieData.count, cutieData)
```


## Building mews

Each mew is actually a curried function. Officially, [curried functions](https://en.wikipedia.org/wiki/Currying) are weird monstrosities made of lots of little functions, but as far as we're concerned, they're just really lenient functions that are okay with not getting enough arguments. Where most functions will kick and scream at you, these just give you new functions that remember the arguments you've already provided.

A freshly plucked mew will first take in all the configuration arguments it needs (across multiple calls, if necessary), and if there are any left over, the rest will be treated as output. After that happens, you'll just keep getting back additional complete mews that treat all their arguments as output.

These are all valid ways to send the same message over Telegram:

```js
let mew = mews.telegram(apiToken, chatID, 'A message, nyan~')
```

```js
let mew = mews.telegram(apiToken)
mew = mew(chatID, 'A message, nyan~')
```

```js
let mew = mews.telegram(apiToken)
mew = mew(chatID)
mew('A message, nyan~')
```

While that last one may seem a*mews*ingly verbose, it still has its uses! For example, if you wanted to send notifications to *two* people using the same bot, you might do something like this:

```js
let telegramFor = mews.telegram(apiToken)
let myMew = telegramFor(myself)
let friendMew = telegramFor(myFriend)

myMew('Reminder: Buy more pudding.')
friendMew("Hey there, cutie~ How are you today?")
```


## Configuring mews

If you want to do more complicated things, mews are also configurable. For example, Telegram's api allows you to decide whether or not your message should be parsed as Markdown. The `telegram` mew exposes this choice to you via the `.markdown` simple property:

```js
let mew = mews.telegram(apiToken, chatID)
mew.markdown("[Here's a link, nya~](https://www.npmjs.com/package/mews)")
```

Properties can go anywhere. Simple properties like `.markdown` simply return a new mew. You generally wouldn't use a simple property multiple times, but this is completely valid:

```js
let mew = mews.telegram.noNotify
mew = mew.noNotify(apiToken)
mew = mew(chatID).noNotify
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

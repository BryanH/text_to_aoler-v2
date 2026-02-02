# Text to 12 year-old  AOLer Script

Fun Script to take ordinary text and convert it to how a 12 year-old AOLer would write.

**Version:** 2.0.0
## Authors:

* Lucas Longley (llongley@uvic.ca),
* BryanH (bryan@master-developer.com)

## Network Diagram

![Network Diagram][netdiag]

## Usage

This runs on a web browser. You will need two `textbox` elements and one `button` or `a`-link to trigger the script.

### Sample frontend code

Your code can be any usable configuration as long as the element names are correct and the trigger calls:
`onclick="translateText(document.translate.translatethis.value)"`

```
<form id="translate" name="translate">
<p><textarea style="width:100%" name="translatethis" rows="15" wrap="logical"></textarea>
<input type="button" value="Translate!" onclick="translateText(document.translate.translatethis.value)"><br><br>
</p>
<p><textarea style="width:100%" name="translated" readonly="readonly" rows="15" wrap="logical"></textarea></p>
</form>
```

| Element        | Required Name   | Notes                                                              |
| -------------- | --------------- | ------------------------------------------------------------------ |
| Text entry box | `translatethis` | Where the user enters the normal text                              |
| Results box    | `translated`    | Read-only box populated with the 12 year-old AOLer version of text |



## Roadmap Status

* Per-acronym weights

* Sentence-aware caps beyond 2

* Minimum sentence length gate

* Decay / forgiveness rules ✅ Implemented

[netdiag]:img/stateflow.svg
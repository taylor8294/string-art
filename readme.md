# String Art

String art is a form of artwork where pegs are placed on a canvas, and a thread is ran from peg to peg in a continuous line to create an image. Populariation of this art form is often attributed to [Petros Vrellis](https://artof01.com/vrellis/bio.html).

This is an interactive web tool that implements a greedy algorithm to generate string art from any image. Pegs can be placed in a circle, ellipse, or rectangle, and threads can be black, white, RGB to create color images.

**[Live Demo](https://taylrr.co.uk/string-art/)**

![Screenshot](https://raw.githubusercontent.com/taylor8294/string-art/master/screenshot.png)

## 🎨 The Process

For each step, the algorithm:

1. Evaluates all possible lines from the current pin to others.
2. Selects the line that passes through the darkest pixels of the source image.
3. "Subtracts" some darkness from the source image along that line to account for the new thread's presence.
4. Repeat until a given number of threads have been drawn.

The result is a web of lines that cluster in dark areas to create a stylized representation of the original image.

---

## 🛠 Features & Functionality

Features of the tool include:

* **Custom image upload:** Process any local image file directly in the browser -- your image does not leave your machine.
* **Pin configuration:** Adjust the number of pins around the frame (higher pin counts allow for finer detail, 250-350 pins is usually the right number), as well as the shape of the pins (circle/ellipse, or rectangle).
* **Threads:** Control the number of threads drawn, as well as the width and opacity of the thread.
* **Real-time rendering:** The algorithm works quick enough in the browser to watch the image be drawn line-by-line.
* **Export:** Save the final result as an SVG or a set of instructions to aid physical recreation.

## 📜 Credits

This repository is an archive of work originally created by **Jeremie Piellard**, with minor tweaks to suit my use case.

* Original Tool: [piellardj.github.io/image-stylization-threading/](https://piellardj.github.io/image-stylization-threading/)
* Original Source: [GitHub - piellardj/image-stylization-threading](https://github.com/piellardj/image-stylization-threading)

You can support Jeremie to say thank you for his work here: [![Donate](https://raw.githubusercontent.com/piellardj/piellardj.github.io/master/images/readme/donate-paypal.svg)](https://www.paypal.com/donate/?hosted_button_id=AF7H7GEJTL95E)

---

This software is provided 'as-is', without any express or implied warranty. In no event will the authors be held liable for any damages arising from the use of this software. Use at own risk.

By [Taylor8294 🌈🐻](https://www.taylrr.co.uk/)
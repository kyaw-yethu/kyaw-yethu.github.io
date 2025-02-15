---
layout: archive
title: "Sharing"
permalink: /sharing/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

The following are some of my knowledge sharing activities, most of which are about AI and programming.

# Teaching

  <ul>{% for post in site.teaching reversed %}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>
  
# Talks

  <ul>{% for post in site.talks reversed %}
    {% include archive-single-talk-cv.html  %}
  {% endfor %}</ul>

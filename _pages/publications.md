---
layout: archive
title:
permalink: /publications/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

# Publications

  <ul>{% for post in site.publications reversed%}
    {% include archive-single-paper.html %}
  {% endfor %}</ul>

# Projects

The following are a few of demonstrable projects of mine listed in reverse-chronological order (i.e, the more recent, the better the quality). If interested in more of my projects, please check out my [Github](!https://github.com/).

## Research Projects

  <ul>{% for post in site.researchProjects reversed%}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>

## Engineering Projects

  <ul>{% for post in site.engineeringProjects reversed%}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>

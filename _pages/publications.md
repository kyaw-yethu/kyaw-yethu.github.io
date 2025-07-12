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

The following are a few of demonstrable projects that I have implemented. If interested in more of my projects, please check out my [Github](!https://github.com/).

## Team Projects

  <ul>{% for post in site.teamProjects reversed%}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>

## Individual Projects

  <ul>{% for post in site.projects reversed%}
    {% include archive-single-cv.html %}
  {% endfor %}</ul>

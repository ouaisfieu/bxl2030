---

title: "Personnages (PNJ)"
layout: single
permalink: /pnj/          # URL propre
classes: wide

---

<ul class="pnj-grid">
{% assign persos = site.pnj | sort: "title" %}
{% for perso in persos %}
  <li>
    <a href="{{ perso.url | relative_url }}">
      <img src="{{ perso.image | relative_url }}" alt="{{ perso.title }}">
      <h2>{{ perso.title }}</h2>
      <p>{{ perso.excerpt }}</p>
    </a>
  </li>
{% endfor %}
</ul>

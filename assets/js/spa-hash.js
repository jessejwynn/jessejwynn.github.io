;(() => {
    const routes = ["/", "/projects", "/about", "/contact"];
  
    function getPath() {
      const h = location.hash.replace(/^#/, "");
      return routes.includes(h) ? h : "/";
    }
  
    function setActive(path) {
      // show the right section
      document.querySelectorAll(".view").forEach(sec => {
        sec.classList.toggle("active", sec.dataset.route === path);
      });
  
      // highlight nav
      document.querySelectorAll(".nav a").forEach(a => {
        a.classList.toggle("active", a.getAttribute("href") === `#${path}`);
      });
  
      // update title (optional)
      const pretty = path === "/" ? "Home" : path.slice(1).replace(/^\w/, c => c.toUpperCase());
      document.title = `Your Name — ${pretty}`;
  
      // a11y: move focus to <main> so screen readers announce new content
      const views = document.getElementById("views");
      views && views.focus({ preventScroll: true });
  
      // scroll top smoothly (respect reduced motion)
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    }
  
    addEventListener("hashchange", () => setActive(getPath()));
    addEventListener("DOMContentLoaded", () => {
      if (!location.hash) location.replace("#/"); // default route
      setActive(getPath());
    });
  })();
  
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

function showCourseSection(courseId) {
  document
    .querySelectorAll(".course-detail")
    .forEach((el) => (el.style.display = "none"));
  const section = document.getElementById(courseId);
  if (section) {
    section.style.display = "block";
    scrollToSection(courseId);
  }
}

let tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

const players = {};
const watchData = {
  python: { duration: 0, watched: 0 },
  htmlcss: { duration: 0, watched: 0 },
  js: { duration: 0, watched: 0 },
  ds: { duration: 0, watched: 0 },
  sql: { duration: 0, watched: 0 },
};

const intervals = {};

function updateProgressBar(course) {
  const bar = document.getElementById(`progress-${course}`);
  if (!bar) return;
  const { watched, duration } = watchData[course];
  let percent = (watched / duration) * 100;
  if (percent > 100) percent = 100;
  bar.style.width = percent + "%";
}

function onYouTubeIframeAPIReady() {
  document.querySelectorAll("iframe[data-course]").forEach((iframe) => {
    const course = iframe.dataset.course;
    players[iframe.id] = new YT.Player(iframe.id, {
      events: {
        onReady: (event) => {
          const player = event.target;
          let tries = 0;
          const checkDuration = setInterval(() => {
            tries++;
            const dur = player.getDuration();
            if (dur > 0 || tries > 20) {
              if (dur > 0) watchData[course].duration += dur;
              updateProgressBar(course);
              clearInterval(checkDuration);
            }
          }, 250);
        },
        onStateChange: (event) => {
          const player = event.target;
          const playerId = iframe.id;
          if (event.data === YT.PlayerState.PLAYING) {
            intervals[playerId] = setInterval(() => {
              const t = player.getCurrentTime();
              if (t > watchData[course].watched) {
                watchData[course].watched = t;
                updateProgressBar(course);
              }
            }, 1000);
          } else {
            if (intervals[playerId]) {
              clearInterval(intervals[playerId]);
              delete intervals[playerId];
            }
          }
        },
      },
    });
  });
}

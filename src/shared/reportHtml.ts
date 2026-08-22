import {
  COLUMN_IDS,
  COLUMN_META,
  type BoardData,
  type ColumnId,
  type Story
} from './types'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function storiesInColumn(stories: Story[], column: ColumnId): Story[] {
  return stories
    .filter((story) => story.column === column)
    .sort((a, b) => a.order - b.order)
}

function projectName(data: BoardData, projectId: string | null): string | null {
  if (!projectId) return null
  return data.projects.find((project) => project.id === projectId)?.name ?? null
}

function storyCard(data: BoardData, story: Story, detailed: boolean): string {
  const project = projectName(data, story.projectId)
  const desc =
    detailed && story.description ? `<p class="desc">${escapeHtml(story.description)}</p>` : ''
  const meta = detailed
    ? `<p class="meta">${escapeHtml(story.priority)} priority${
        story.points != null ? ` · ${story.points} pts` : ''
      }</p>`
    : ''

  return `
    <article class="card">
      <p class="id">${escapeHtml(story.id)}</p>
      <h3>${escapeHtml(story.title)}</h3>
      ${project ? `<p class="from">from the project ${escapeHtml(project)}</p>` : ''}
      ${desc}
      ${meta}
    </article>
  `
}

export function buildBoardReportHtml(
  data: BoardData,
  generatedAt: Date,
  logoSrc = ''
): string {
  const grouped = Object.fromEntries(
    COLUMN_IDS.map((column) => [column, storiesInColumn(data.stories, column)])
  ) as Record<ColumnId, Story[]>
  const done = grouped.done.length
  const dateLabel = generatedAt.toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short'
  })

  const overview = COLUMN_IDS.map((column) => {
    const stories = grouped[column]
    const cards =
      stories.length === 0
        ? '<p class="empty">No stories</p>'
        : stories.map((story) => storyCard(data, story, false)).join('')
    return `
      <section class="column">
        <header>
          <span class="dot" style="background:${COLUMN_META[column].accent}"></span>
          <div>
            <h2>${COLUMN_META[column].label}</h2>
            <p>${stories.length} ${stories.length === 1 ? 'story' : 'stories'}</p>
          </div>
        </header>
        ${cards}
      </section>
    `
  }).join('')

  const details = COLUMN_IDS.map((column) => {
    const stories = grouped[column]
    const cards =
      stories.length === 0
        ? '<p class="empty">No stories in this column.</p>'
        : stories.map((story) => storyCard(data, story, true)).join('')
    return `
      <section class="detail">
        <h2>${COLUMN_META[column].label}</h2>
        ${cards}
      </section>
    `
  }).join('')

  const projectLines =
    data.projects.length === 0
      ? '<p class="empty">No projects.</p>'
      : `<ul class="projects">${data.projects
          .map((project) => {
            const count = data.stories.filter((story) => story.projectId === project.id).length
            return `<li><strong>${escapeHtml(project.name)}</strong> · ${count} ${
              count === 1 ? 'story' : 'stories'
            }</li>`
          })
          .join('')}</ul>`

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Solo Scrum board report</title>
    <style>
      @page { size: letter landscape; margin: 0.55in; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        color: #12141a;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: #fff;
      }
      h1, h2, h3, p, ul { margin: 0; }
      .hero { display: flex; justify-content: space-between; gap: 24px; align-items: flex-end; padding-bottom: 16px; border-bottom: 1px solid #e6e8ee; }
      .brand { display: flex; align-items: center; gap: 12px; }
      .brand img { width: 44px; height: 44px; object-fit: contain; border-radius: 10px; }
      .hero h1 { font-size: 26px; letter-spacing: -0.04em; }
      .hero .sub { margin-top: 4px; color: #5d6472; font-size: 12px; }
      .stats { display: flex; gap: 18px; color: #5d6472; font-size: 12px; }
      .stats strong { display: block; color: #12141a; font-size: 18px; letter-spacing: -0.03em; }
      h2 { font-size: 15px; letter-spacing: -0.03em; }
      .board { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 18px; }
      .column { border: 1px solid #eceff4; border-radius: 12px; padding: 10px; min-height: 120px; }
      .column header { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 10px; }
      .column header p, .from, .id, .meta, .empty, .desc { color: #5d6472; font-size: 11px; }
      .dot { width: 8px; height: 8px; border-radius: 99px; margin-top: 5px; flex-shrink: 0; }
      .card { border: 1px solid #eef0f5; border-radius: 10px; padding: 8px 9px; margin-bottom: 8px; break-inside: avoid; }
      .card h3 { font-size: 12px; line-height: 1.35; letter-spacing: -0.02em; }
      .from { margin-top: 3px; }
      .desc { margin-top: 6px; line-height: 1.45; white-space: pre-wrap; }
      .meta { margin-top: 6px; text-transform: capitalize; }
      .projects { margin-top: 10px; padding-left: 18px; font-size: 12px; line-height: 1.7; }
      .block { margin-top: 22px; page-break-before: always; }
      .block h2 { margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #eceff4; }
      .detail .card { margin-bottom: 10px; padding: 12px; }
      .detail .card h3 { font-size: 14px; }
    </style>
  </head>
  <body>
    <header class="hero">
      <div class="brand">
        ${logoSrc ? `<img src="${logoSrc}" alt="" />` : ''}
        <div>
          <h1>Solo Scrum</h1>
          <p class="sub">Board report · ${escapeHtml(dateLabel)}</p>
        </div>
      </div>
      <div class="stats">
        <div><strong>${data.projects.length}</strong>projects</div>
        <div><strong>${data.stories.length}</strong>stories</div>
        <div><strong>${done}</strong>done</div>
      </div>
    </header>
    <section>
      <div class="board">${overview}</div>
    </section>
    <section class="block">
      <h2>Projects</h2>
      ${projectLines}
    </section>
    <section class="block">
      <h2>Story details</h2>
      ${details}
    </section>
  </body>
</html>`
}

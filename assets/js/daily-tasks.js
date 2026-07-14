(function () {
    const daily = window.heartopiaDailyTasks;
    if (!daily) return;

    function formatCountdown(ms) {
        const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
        return String(Math.floor(totalSeconds / 3600)).padStart(2, '0') + ':' + String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0') + ':' + String(totalSeconds % 60).padStart(2, '0');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character];
        });
    }

    function renderTask(task, done) {
        const checked = done.has(task.id);
        const condition = task.when ? '<span class="text-xs font-bold rounded-full bg-cozy-sky/20 px-2 py-1 text-cozy-bark">' + escapeHtml(task.when) + '</span>' : '';
        const note = task.note ? '<p class="text-sm text-cozy-wood mb-2">' + escapeHtml(task.note) + '</p>' : '';
        const link = task.link ? '<a href="' + task.link + '" class="text-cozy-coral font-medium hover:underline">Open related page</a>' : '';
        const remove = task.custom ? '<button type="button" data-remove-custom="' + task.id + '" class="text-cozy-wood hover:text-cozy-coral">Remove</button>' : '';
        return '<article class="task-row ' + (checked ? 'task-done' : '') + ' rounded-2xl border border-cozy-peach/40 bg-cozy-cream/60 p-4 flex items-start gap-4">'
            + '<input type="checkbox" data-task-id="' + task.id + '"' + (checked ? ' checked' : '') + ' class="mt-1 w-5 h-5 rounded border-cozy-peach text-cozy-coral focus:ring-cozy-coral">'
            + '<div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2 mb-1"><h3 class="task-title font-bold text-cozy-bark">' + escapeHtml(task.title) + '</h3>' + condition + '</div>'
            + note + '<div class="flex flex-wrap gap-3 text-sm">' + link + remove + '</div></div></article>';
    }

    function renderGroup(tasks, done, group, label, description) {
        const groupTasks = tasks.filter(function (task) { return task.group === group; });
        if (!groupTasks.length) return '';
        return '<section class="space-y-3 ' + (group === 'Optional' ? 'pt-3' : '') + '"><div class="flex flex-wrap items-baseline justify-between gap-2 px-1"><div><h3 class="font-display text-xl font-bold text-cozy-bark">' + label + '</h3><p class="text-sm text-cozy-wood">' + description + '</p></div><span class="text-xs font-bold rounded-full bg-white px-2 py-1 text-cozy-wood">' + groupTasks.length + ' tasks</span></div>' + groupTasks.map(function (task) { return renderTask(task, done); }).join('') + '</section>';
    }

    function render() {
        const list = document.getElementById('daily-task-list');
        const summary = document.getElementById('daily-summary');
        const regionSelect = document.getElementById('server-region');
        if (!list || !summary || !regionSelect) return;

        const today = daily.getToday();
        const context = today.context;
        const tasks = today.tasks;
        const done = today.done;
        const count = tasks.filter(function (task) { return done.has(task.id); }).length;
        const percent = tasks.length ? Math.round((count / tasks.length) * 100) : 0;

        regionSelect.value = context.regionKey;
        summary.innerHTML = '<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5"><div><p class="text-sm font-bold uppercase tracking-wide text-cozy-coral mb-2">Saved in this browser</p><h2 class="font-display text-2xl md:text-3xl font-bold">' + count + ' / ' + tasks.length + ' tasks done today</h2><p class="text-cozy-wood mt-2">Checklist day: ' + context.state.resetKey + ' on ' + context.state.region.label + '. Progress is private to this browser.</p></div><div class="min-w-[240px]"><div class="flex justify-between text-sm mb-2"><span>Today progress</span><strong>' + percent + '%</strong></div><div class="h-4 rounded-full bg-cozy-cream border border-cozy-peach/50 overflow-hidden"><div class="h-full bg-cozy-coral transition-all duration-300" style="width:' + percent + '%"></div></div></div></div>';
        list.innerHTML = renderGroup(tasks, done, 'Important', 'Important daily checks', 'Finish the core route first. Weather and event labels only apply when active.') + renderGroup(tasks, done, 'Optional', 'Optional progress checks', 'Use these for social, pets, collections, or your personal goals.');
    }

    function updateCountdown() {
        const state = daily.getContext().state;
        const countdown = document.getElementById('reset-countdown');
        const summary = document.getElementById('reset-summary');
        if (!countdown || !summary) return;
        countdown.textContent = formatCountdown(state.nextReset.getTime() - Date.now());
        summary.textContent = state.region.label + ' reset estimate: 6:00 AM server time.';
    }

    document.addEventListener('DOMContentLoaded', function () {
        const regionSelect = document.getElementById('server-region');
        const form = document.getElementById('custom-task-form');
        const input = document.getElementById('custom-task-input');

        render();
        updateCountdown();
        window.setInterval(updateCountdown, 1000);
        window.setInterval(render, 60000);

        regionSelect?.addEventListener('change', function () {
            daily.setStoredRegion(regionSelect.value);
            render();
            updateCountdown();
        });

        document.addEventListener('change', function (event) {
            const checkbox = event.target.closest('[data-task-id]');
            if (!checkbox) return;
            daily.setDone(checkbox.dataset.taskId, checkbox.checked);
            render();
        });

        document.addEventListener('click', function (event) {
            const markAll = event.target.closest('#mark-all');
            const clearToday = event.target.closest('#clear-today');
            const removeCustom = event.target.closest('[data-remove-custom]');
            if (markAll) {
                daily.setAllDone(daily.getToday().tasks.map(function (task) { return task.id; }));
                render();
            }
            if (clearToday) {
                daily.clearDone();
                render();
            }
            if (removeCustom) {
                daily.removeCustomTask(removeCustom.dataset.removeCustom);
                render();
            }
        });

        form?.addEventListener('submit', function (event) {
            event.preventDefault();
            const title = input.value.trim();
            if (!title) return;
            daily.addCustomTask(title);
            input.value = '';
            render();
        });
    });
})();

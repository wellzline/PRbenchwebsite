// static/js/datatable-init.js

$(function() {

  // ==== Leaderboard Table ====
  $('#leaderboard-table').DataTable({
    // global search: smart + fuzzy
    search: {
      regex: false,
      smart: true
    },
    // place length + filter into our custom container
    dom: '<"top-controls"l<"table-legend">f>tip',
    ajax: {
      url: 'static/src/data/prbench_table8.json',
      dataSrc: '',
      error: function(xhr, error, thrown) {
        console.error('Failed to load JSON:', xhr.status, thrown);
      }
    },
    // 19 column definitions
    columns: [
      { data: 'dataset', defaultContent: '' },               // 0
      { data: 'model',   defaultContent: '' },               // 1
      { data: 'method',  defaultContent: '' },               // 2
      { data: 'acc',     defaultContent: '' },               // 3

      // --- PR under Uniform ---
      { data: null, render: d => d.pr_uniform['0.03'] },     // 4
      { data: null, render: d => d.pr_uniform['0.08'] },     // 5
      { data: null, render: d => d.pr_uniform['0.1']  },     // 6
      { data: null, render: d => d.pr_uniform['0.12'] },     // 7

      // --- PR under Gaussian ---
      { data: null, render: d => d.pr_gaussian['0.03'] },    // 8
      { data: null, render: d => d.pr_gaussian['0.08'] },    // 9
      { data: null, render: d => d.pr_gaussian['0.1']  },    // 10
      { data: null, render: d => d.pr_gaussian['0.12'] },    // 11

      // --- PR under Laplace ---
      { data: null, render: d => d.pr_laplace['0.03'] },     // 12
      { data: null, render: d => d.pr_laplace['0.08'] },     // 13
      { data: null, render: d => d.pr_laplace['0.1']  },     // 14
      { data: null, render: d => d.pr_laplace['0.12'] },     // 15

      // --- Generalisation Error ---
      { data: null, render: d => d.ge.uni },                 // 16
      { data: null, render: d => d.ge.gau },                 // 17
      { data: null, render: d => d.ge.lap }                  // 18
    ],

    order: [],    // 保持 JSON 原始顺序
    pageLength: 25,

    // ==== 根据 method 给每行打 class，以便着色 ====
    rowCallback: function(row, data) {
      $(row).removeClass('row-emr row-ar row-pr');
      if (data.method === 'ERM') {
        $(row).addClass('row-emr');
      } else if (data.method === 'PGD') {
        $(row).addClass('row-ar');
      } else if (['Corr_Uniform','Corr_Gaussian','Corr_Laplace'].includes(data.method)) {
        $(row).addClass('row-pr');
      }
    },

    // Insert button filtering after initialization is complete & legend
    initComplete: function() {
      const api = this.api();

      // Button Filtering Logic - Regular Expression Exact Match
      function makeButtons(vals, sel, colIdx) {
        const $wrap = $(sel).empty();
        $wrap.append(`<button class="btn btn-sm me-1 active" data-col="${colIdx}" data-val="">All</button>`);
        vals.forEach(v => {
          $wrap.append(`<button class="btn btn-sm me-1" data-col="${colIdx}" data-val="${v}">${v}</button>`);
        });
        $wrap.on('click', 'button', function() {
          const $btn = $(this),
                val  = $btn.data('val'),
                col  = api.column($btn.data('col'));
          $wrap.find('button').removeClass('active');
          $btn.addClass('active');
          if (!val) {
            // reset filter
            col.search('').draw();
          } else {
            // exact regex map
            const esc = $.fn.dataTable.util.escapeRegex(val);
            col.search(`^${esc}$`, true, false).draw();
          }
        });
      }

      makeButtons(api.column(0).data().unique().sort().toArray(), '#dataset-buttons', 0);
      makeButtons(api.column(1).data().unique().sort().toArray(), '#model-buttons',   1);
      makeButtons(api.column(2).data().unique().sort().toArray(), '#method-buttons',  2);

      // Insert Legend to the front of the top-controls container
      const legendHtml = `
        <div class="table-legend">
          <div class="legend-item"><span class="legend-box box-emr"></span>Neither AR nor PR</div>
          <div class="legend-item"><span class="legend-box box-ar"></span>AR methods</div>
          <div class="legend-item"><span class="legend-box box-pr"></span>PR methods</div>
        </div>`;
      $( api.table().container() ).find('.table-legend').html(legendHtml);
    }
  });


  // ==== Performance Table ====
  $('#performance-table').DataTable({
    // global search: smart + fuzzy
    scrollX: true, 
    search: {
      regex: false,
      smart: true
    },
    dom: '<"top-controls"l<"table-legend">f>tip',
    ajax: {
      url: 'static/src/data/prbench_table9.json',
      dataSrc: ''
    },
    columns: [
      // 0–3 top-level fields
      { data: 'dataset', defaultContent: '' },
      { data: 'model',   defaultContent: '' },
      { data: 'method',  defaultContent: '' },
      { data: 'acc',     defaultContent: '' },

      // AR columns
      { data: null, render: d => d.ar['PGD10'] },
      { data: null, render: d => d.ar['PGD20'] },
      { data: null, render: d => d.ar['CW20']  },
      { data: null, render: d => d.ar['AA']    },

      // PR columns
      { data: null, render: d => d.pr['0.03']  },
      { data: null, render: d => d.pr['0.08']  },
      { data: null, render: d => d.pr['0.10']  },
      { data: null, render: d => d.pr['0.12']  },

      // ProbAccPR columns
      { data: null, render: d => d.probacc['0.10'] },
      { data: null, render: d => d.probacc['0.05'] },
      { data: null, render: d => d.probacc['0.01'] },

      // GEAR columns
      { data: null, render: d => d.ge_ar['PGD20'] },

      // GEPR columns
      { data: null, render: d => d.ge_pr['0.03'] },
      { data: null, render: d => d.ge_pr['0.08'] },
      { data: null, render: d => d.ge_pr['0.10'] },
      { data: null, render: d => d.ge_pr['0.12'] },

      // training time
      { data: null, render: d => d.time_s_per_ep }
    ],

    order: [],
    pageLength: 25,

    rowCallback: function(row, data) {
      $(row).removeClass('row-emr row-ar row-pr');
      if (data.method === 'ERM') {
        $(row).addClass('row-emr');
      } else if (['ALP','CLP','KL-PGD','MART','PGD','TRADES'].includes(data.method)) {
        $(row).addClass('row-ar');
      } else if (['CVaR','Corr_Uniform'].includes(data.method)) {
        $(row).addClass('row-pr');
      }
    },

    initComplete: function() {
      const api = this.api();

      // Button filtering (exact match)
      function makeButtons(vals, sel, colIdx) {
        const $wrap = $(sel).empty();
        $wrap.append(`<button class="btn btn-sm me-1 active" data-col="${colIdx}" data-val="">All</button>`);
        vals.forEach(v => {
          $wrap.append(`<button class="btn btn-sm me-1" data-col="${colIdx}" data-val="${v}">${v}</button>`);
        });
        $wrap.on('click','button',function(){
          const $btn = $(this),
                val  = $btn.data('val'),
                col  = api.column($btn.data('col'));
          $wrap.find('button').removeClass('active');
          $btn.addClass('active');
          if (!val) {
            col.search('').draw();
          } else {
            const esc = $.fn.dataTable.util.escapeRegex(val);
            col.search(`^${esc}$`, true, false).draw();
          }
        });
      }

      makeButtons(api.column(0).data().unique().sort().toArray(), '#performance-dataset-buttons', 0);
      makeButtons(api.column(1).data().unique().sort().toArray(), '#performance-model-buttons',   1);
      makeButtons(api.column(2).data().unique().sort().toArray(), '#performance-method-buttons',  2);

      // insert Legend
      const legendHtml = `
        <div class="table-legend">
          <div class="legend-item"><span class="legend-box box-emr"></span>Neither AR nor PR</div>
          <div class="legend-item"><span class="legend-box box-ar"></span>AR methods</div>
          <div class="legend-item"><span class="legend-box box-pr"></span>PR methods</div>
        </div>`;
      $( api.table().container() ).find('.table-legend').html(legendHtml);
    }
  });

});

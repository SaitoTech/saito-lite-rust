module.exports = (app) => {
    return `

    <section id="page-title" class="mb-6">
    <div class="container clearfix">
      <h1 class="saito-color-primary">Modals</h1>
    </div>
  </section>
    <button class="" data-bs-toggle="modal" data-bs-target="#myModal">
    Modal
  </button>

  <!-- Modal -->
  <div
    class="modal modal-center fade"
    id="myModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title" id="myModalLabel">Heading</h4>
          <a
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-hidden="true"
          ></a>
        </div>
        <div class="modal-body">These are modal content</div>
        <div class="modal-footer">
          <button
            data-bs-dismiss="modal"
            aria-hidden="true"
            class="saito-btn-secondary"
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
    `
}
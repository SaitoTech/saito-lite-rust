module.exports = () => {
    return `            <section id="page-title" class="mb-6">
    <div class="container clearfix">
      <h1 class="saito-color-primary">List Group and Cards</h1>
    </div>
  </section>

  <h3>List Groups</h3>

  <ul class="list-group">
    <li class="list-group-item">Cras justo odio</li>
    <li class="list-group-item">Dapibus ac facilisis in</li>
    <li class="list-group-item">Morbi leo risus</li>
    <li class="list-group-item">Porta ac consectetur ac</li>
    <li class="list-group-item">Vestibulum at eros</li>
  </ul>

  <div class="line"></div>

  <h4>List Groups - Badges</h4>

  <div class="row">
    <div class="col-md-6">
      <ul class="list-group">
        <li class="list-group-item">
          Cras justo odio
          <span
            class="badge bg-secondary float-end"
            style="margin-top: 3px"
            >14</span
          >
        </li>
      </ul>
    </div>
  </div>

  <div class="line"></div>

  <h4>List Groups - Linked</h4>

  <div class="list-group">
    <a href="#" class="list-group-item list-group-item-action active">
      Cras justo odio
    </a>
    <a href="#" class="list-group-item list-group-item-action"
      >Dapibus ac facilisis in</a
    >
    <a href="#" class="list-group-item list-group-item-action"
      >Morbi leo risus</a
    >
    <a href="#" class="list-group-item list-group-item-action"
      >Porta ac consectetur ac</a
    >
    <a href="#" class="list-group-item list-group-item-action"
      >Vestibulum at eros</a
    >
  </div>

  <div class="line"></div>

  <div class="row col-mb-50">
    <div class="col-md-6">
      <h4>List Groups - Disable</h4>
      <ul class="list-group">
        <li class="list-group-item disabled" aria-disabled="true">
          A disabled item
        </li>
        <li class="list-group-item">A second item</li>
        <li class="list-group-item">A third item</li>
        <li class="list-group-item">A fourth item</li>
        <li class="list-group-item">And a fifth one</li>
      </ul>
    </div>

    <div class="col-md-6">
      <h4>List Groups - Flush</h4>
      <ul class="list-group list-group-flush">
        <li class="list-group-item">An item</li>
        <li class="list-group-item">A second item</li>
        <li class="list-group-item">A third item</li>
        <li class="list-group-item">A fourth item</li>
        <li class="list-group-item">And a fifth one</li>
      </ul>
    </div>

    <div class="col-md-6">
      <h4>List Groups - Numbered</h4>
      <ol class="list-group list-group-numbered">
        <li class="list-group-item">Cras justo odio</li>
        <li class="list-group-item">Cras justo odio</li>
        <li class="list-group-item">Cras justo odio</li>
      </ol>
    </div>

    <div class="col-md-6">
      <h4>List Groups - Custom Content</h4>
      <ol class="list-group list-group-numbered">
        <li
          class="list-group-item d-flex justify-content-between align-items-start"
        >
          <div class="ms-2 me-auto">
            <div class="fw-bold">Subheading</div>
            Cras justo odio
          </div>
          <span class="badge bg-primary rounded-pill">14</span>
        </li>
        <li
          class="list-group-item d-flex justify-content-between align-items-start"
        >
          <div class="ms-2 me-auto">
            <div class="fw-bold">Subheading</div>
            Cras justo odio
          </div>
          <span class="badge bg-primary rounded-pill">14</span>
        </li>
        <li
          class="list-group-item d-flex justify-content-between align-items-start"
        >
          <div class="ms-2 me-auto">
            <div class="fw-bold">Subheading</div>
            Cras justo odio
          </div>
          <span class="badge bg-primary rounded-pill">14</span>
        </li>
      </ol>
    </div>
  </div>

  <div class="line"></div>

  <div class="row col-mb-50">
    <div class="col-md-6">
      <h4>List Groups - Checkboxes</h4>

      <div class="list-group">
        <label
          class="list-group-item mb-0 nott fw-normal ls0 text-size-sm font-body"
        >
          <input
            class="form-check-input me-1"
            type="checkbox"
            value=""
            aria-label="..."
          />
          First checkbox
        </label>
        <label
          class="list-group-item mb-0 nott fw-normal ls0 text-size-sm font-body"
        >
          <input
            class="form-check-input me-1"
            type="checkbox"
            value=""
            aria-label="..."
          />
          Second checkbox
        </label>
        <label
          class="list-group-item mb-0 nott fw-normal ls0 text-size-sm font-body"
        >
          <input
            class="form-check-input me-1"
            type="checkbox"
            value=""
            aria-label="..."
          />
          Third checkbox
        </label>
        <label
          class="list-group-item mb-0 nott fw-normal ls0 text-size-sm font-body"
        >
          <input
            class="form-check-input me-1"
            type="checkbox"
            value=""
            aria-label="..."
          />
          Fourth checkbox
        </label>
        <label
          class="list-group-item mb-0 nott fw-normal ls0 text-size-sm font-body"
        >
          <input
            class="form-check-input me-1"
            type="checkbox"
            value=""
            aria-label="..."
          />
          Fifth checkbox
        </label>
      </div>
    </div>
    <div class="col-md-6">
      <h4>List Groups - Radios</h4>
      <div class="list-group">
        <label
          class="list-group-item mb-0 nott fw-normal ls0 text-size-sm font-body"
        >
          <input
            class="form-check-input me-1"
            type="radio"
            name="list-group-radio"
            value=""
            aria-label="..."
            checked
          />
          First radio
        </label>
        <label
          class="list-group-item mb-0 nott fw-normal ls0 text-size-sm font-body"
        >
          <input
            class="form-check-input me-1"
            type="radio"
            name="list-group-radio"
            value=""
            aria-label="..."
          />
          Second radio
        </label>
        <label
          class="list-group-item mb-0 nott fw-normal ls0 text-size-sm font-body"
        >
          <input
            class="form-check-input me-1"
            type="radio"
            name="list-group-radio"
            value=""
            aria-label="..."
          />
          Third radio
        </label>
        <label
          class="list-group-item mb-0 nott fw-normal ls0 text-size-sm font-body"
        >
          <input
            class="form-check-input me-1"
            type="radio"
            name="list-group-radio"
            value=""
            aria-label="..."
          />
          Fourth radio
        </label>
        <label
          class="list-group-item mb-0 nott fw-normal ls0 text-size-sm font-body"
        >
          <input
            class="form-check-input me-1"
            type="radio"
            name="list-group-radio"
            value=""
            aria-label="..."
          />
          Fifth radio
        </label>
      </div>
    </div>
  </div>

  <div class="line"></div>

  <h4>Custom Contents</h4>

  <div class="list-group">
    <a
      href="#"
      class="list-group-item list-group-item-action flex-column align-items-start active"
    >
      <div class="d-flex w-100 justify-content-between">
        <h4 class="mb-2 text-white">List group item heading</h4>
        <small>3 days ago</small>
      </div>
      <p class="mb-1">
        Donec id elit non mi porta gravida at eget metus. Maecenas sed
        diam eget risus varius blandit.
      </p>
      <small>Donec id elit non mi porta.</small>
    </a>
    <a
      href="#"
      class="list-group-item list-group-item-action flex-column align-items-start"
    >
      <div class="d-flex w-100 justify-content-between">
        <h4 class="mb-2">List group item heading</h4>
        <small class="text-muted">3 days ago</small>
      </div>
      <p class="mb-1">
        Donec id elit non mi porta gravida at eget metus. Maecenas sed
        diam eget risus varius blandit.
      </p>
      <small class="text-muted">Donec id elit non mi porta.</small>
    </a>
    <a
      href="#"
      class="list-group-item list-group-item-action flex-column align-items-start"
    >
      <div class="d-flex w-100 justify-content-between">
        <h4 class="mb-2">List group item heading</h4>
        <small class="text-muted">3 days ago</small>
      </div>
      <p class="mb-1">
        Donec id elit non mi porta gravida at eget metus. Maecenas sed
        diam eget risus varius blandit.
      </p>
      <small class="text-muted">Donec id elit non mi porta.</small>
    </a>
  </div>

  <div class="line"></div>

  <h3>Card</h3>

  <div class="card">
    <div class="card-body">
      <p class="card-text">Basic card example</p>
    </div>
  </div>

  <div class="line"></div>

  <h4>Card with heading</h4>

  <div class="row col-mb-50">
    <div class="col-md-6">
      <div class="card">
        <div class="card-header">Card Heading without title</div>
        <div class="card-body">
          <p class="card-text">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Vel, esse, velit, eaque officiis mollitia inventore ipsum
            minus quo itaque provident error adipisci quisquam ratione
            assumenda at illo doloribus beatae totam?
          </p>
        </div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="card">
        <div class="card-header">Card Heading</div>
        <div class="card-body">
          <h4 class="card-title">Card Title</h4>
          <p class="card-text">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Ut, at, vitae, veritatis, temporibus soluta accusamus eum
            accusantium incidunt eius quisquam suscipit inventore neque.
            Distinctio, impedit.
          </p>
        </div>
      </div>
    </div>
  </div>

  <div class="line"></div>

  <h4>Card with footer</h4>

  <div class="card">
    <div class="card-body">
      <p class="card-text">Card content</p>
    </div>
    <div class="card-footer">Card footer</div>
  </div>

  <div class="line"></div>

  <h4>Card with Tables</h4>

  <div class="card">
    <!-- Default panel contents -->
    <div class="card-header">Card Heading</div>
    <div class="card-body">
      <p class="card-text">
        Some default panel content here. Nulla vitae elit libero, a
        pharetra augue. Aenean lacinia bibendum nulla sed consectetur.
        Aenean eu leo quam. Pellentesque ornare sem lacinia quam
        venenatis vestibulum. Nullam id dolor id nibh ultricies vehicula
        ut id elit.
      </p>
    </div>

    <!-- Table -->
    <table class="table mb-0">
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Larry</td>
          <td>the Bird</td>
          <td>@twitter</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="line"></div>

  <div class="card">
    <!-- Default panel contents -->
    <div class="card-header">Card Heading</div>

    <!-- Table -->
    <table class="table mb-0">
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Larry</td>
          <td>the Bird</td>
          <td>@twitter</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="line"></div>

  <h4>Card with List Groups</h4>

  <div class="card">
    <!-- Default panel contents -->
    <div class="card-header">Card Heading</div>
    <div class="card-body">
      <p class="card-text">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Obcaecati, ratione, facere, blanditiis, incidunt beatae rem
        veniam autem sequi soluta in totam saepe necessitatibus repellat
        eos tenetur sapiente laboriosam corrupti. Asperiores.
      </p>
    </div>

    <!-- List group -->
    <ul class="list-group list-group-flush">
      <li class="list-group-item">Cras justo odio</li>
      <li class="list-group-item">Dapibus ac facilisis in</li>
      <li class="list-group-item">Morbi leo risus</li>
      <li class="list-group-item">Porta ac consectetur ac</li>
      <li class="list-group-item">Vestibulum at eros</li>
    </ul>
  </div>`
}
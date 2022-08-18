module.exports = (app, mod, link) => {

    let link_preview = '';
    if (typeof link != 'undefined') {
      link_preview = `<section class="section">
                        <div class="container">
                          <div class="box" style="width:300px">
                            <div class='item'>
                              <img class="link-image" src="${link.image}">
                            </div>
                            <div class='item'>
                              <div class="is-clipped">
                                <div id="mytitle" class="has-text-weight-bold">${link.title}</div>
                                <div id="mydescription" class="mt-2">${link.description}</div>
                                <div id="myurl" class="mt-2 is-size-7">${link.url}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>`;
    }

    return link_preview;
}


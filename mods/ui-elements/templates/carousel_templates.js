module.exports = (app) => {

    return `
    <div class="content-wrap pb-0">
				<div class="container">

					<div class="fancy-title title-center title-border">
						<h3>Image Carousel</h3>
					</div>

					<div id="oc-images" class="owl-carousel image-carousel carousel-widget" data-items-xs="2" data-items-sm="3" data-items-lg="4" data-items-xl="5">

						<div class="oc-item">
							<a href="#"><img src="/ui-elements/images/portfolio/4/4-1.jpg" alt="Image 1"></a>
						</div>
						<div class="oc-item">
							<a href="#"><img src="/ui-elements/images/portfolio/4/6-1.jpg" alt="Image 2"></a>
						</div>
						<div class="oc-item">
							<a href="#"><img src="/ui-elements/images/portfolio/4/6-2.jpg" alt="Image 3"></a>
						</div>
						<div class="oc-item">
							<a href="#"><img src="/ui-elements/images/portfolio/4/6-3.jpg" alt="Image 4"></a>
						</div>
						<div class="oc-item">
							<a href="#"><img src="/ui-elements/images/portfolio/4/9-1.jpg" alt="Image 5"></a>
						</div>
						<div class="oc-item">
							<a href="#"><img src="/ui-elements/images/portfolio/4/9-2.jpg" alt="Image 6"></a>
						</div>
						<div class="oc-item">
							<a href="#"><img src="/ui-elements/images/portfolio/4/12-1.jpg" alt="Image 7"></a>
						</div>

					</div>


					<div class="clear"></div>

					<div class="fancy-title title-center title-border topmargin">
						<h3>Portfolio Carousel</h3>
					</div>

					<div id="oc-portfolio" class="owl-carousel portfolio-carousel carousel-widget" data-pagi="false" data-items-xs="1" data-items-sm="2" data-items-md="3" data-items-lg="4">

						<div class="portfolio-item">
							<div class="portfolio-image">
								<a href="portfolio-single.html">
									<img src="/ui-elements/images/portfolio/4/1.jpg" alt="Open Imagination">
								</a>
								<div class="bg-overlay">
									<div class="bg-overlay-content dark" data-hover-animate="fadeIn" data-hover-speed="350">
										<a href="images/portfolio/full/1.jpg" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeInUpSmall" data-hover-speed="350" data-lightbox="image"><i class="icon-line-plus"></i></a>
										<a href="portfolio-single.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeInUpSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn" data-hover-speed="350"></div>
								</div>
							</div>
							<div class="portfolio-desc">
								<h3><a href="portfolio-single.html">Open Imagination</a></h3>
								<span><a href="#">Media</a>, <a href="#">Icons</a></span>
							</div>
						</div>

						<div class="portfolio-item">
							<div class="portfolio-image">
								<a href="portfolio-single.html">
									<img src="/ui-elements/images/portfolio/4/2.jpg" alt="Locked Steel Gate">
								</a>
								<div class="bg-overlay">
									<div class="bg-overlay-content dark" data-hover-animate="fadeIn" data-hover-speed="350">
										<a href="images/portfolio/full/2.jpg" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeInUpSmall" data-hover-speed="350" data-lightbox="image"><i class="icon-line-plus"></i></a>
										<a href="portfolio-single.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeInUpSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn" data-hover-speed="350"></div>
								</div>
							</div>
							<div class="portfolio-desc">
								<h3><a href="portfolio-single.html">Locked Steel Gate</a></h3>
								<span><a href="#">Illustrations</a></span>
							</div>
						</div>
						<div class="portfolio-item">
							<div class="portfolio-image">
								<a href="#">
									<img src="/ui-elements/images/portfolio/4/3.jpg" alt="Mac Sunglasses">
								</a>
								<div class="bg-overlay">
									<div class="bg-overlay-content dark" data-hover-animate="fadeIn" data-hover-speed="350">
										<a href="https://vimeo.com/89396394" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeInUpSmall" data-hover-speed="350" data-lightbox="iframe"><i class="icon-line-play"></i></a>
										<a href="portfolio-single.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeInUpSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn" data-hover-speed="350"></div>
								</div>
							</div>
							<div class="portfolio-desc">
								<h3><a href="portfolio-single-video.html">Mac Sunglasses</a></h3>
								<span><a href="#">Graphics</a>, <a href="#">UI Elements</a></span>
							</div>
						</div>
						<div class="portfolio-item">
							<div class="portfolio-image">
								<a href="#">
									<img src="/ui-elements/images/portfolio/4/4.jpg" alt="Morning Dew">
								</a>
								<div class="bg-overlay" data-lightbox="gallery">
									<div class="bg-overlay-content dark" data-hover-animate="fadeIn">
										<a href="images/portfolio/full/4.jpg" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350" data-lightbox="gallery-item"><i class="icon-line-stack-2"></i></a>
										<a href="images/portfolio/full/4-1.jpg" class="d-none" data-lightbox="gallery-item"></a>
										<a href="portfolio-single.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn"></div>
								</div>
							</div>
							<div class="portfolio-desc">
								<h3><a href="portfolio-single-gallery.html">Morning Dew</a></h3>
								<span><a href="#">Icons</a>, <a href="#">Illustrations</a></span>
							</div>
						</div>
						<div class="portfolio-item">
							<div class="portfolio-image">
								<a href="portfolio-single.html">
									<img src="/ui-elements/images/portfolio/4/5.jpg" alt="Console Activity">
								</a>
								<div class="bg-overlay">
									<div class="bg-overlay-content dark" data-hover-animate="fadeIn">
										<a href="images/portfolio/full/5.jpg" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350" data-lightbox="image" title="Image"><i class="icon-line-plus"></i></a>
										<a href="portfolio-single.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn"></div>
								</div>
							</div>
							<div class="portfolio-desc">
								<h3><a href="portfolio-single.html">Console Activity</a></h3>
								<span><a href="#">UI Elements</a>, <a href="#">Media</a></span>
							</div>
						</div>
						<div class="portfolio-item">
							<div class="portfolio-image">
								<a href="portfolio-single-gallery.html">
									<img src="/ui-elements/images/portfolio/4/6.jpg" alt="Shake It!">
								</a>
								<div class="bg-overlay" data-lightbox="gallery">
									<div class="bg-overlay-content dark" data-hover-animate="fadeIn">
										<a href="images/portfolio/full/6.jpg" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350" data-lightbox="gallery-item"><i class="icon-line-stack-2"></i></a>
										<a href="images/portfolio/full/6-1.jpg" class="d-none" data-lightbox="gallery-item"></a>
										<a href="images/portfolio/full/6-2.jpg" class="d-none" data-lightbox="gallery-item"></a>
										<a href="images/portfolio/full/6-3.jpg" class="d-none" data-lightbox="gallery-item"></a>
										<a href="portfolio-single-gallery.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn"></div>
								</div>
							</div>
							<div class="portfolio-desc">
								<h3><a href="portfolio-single-gallery.html">Shake It!</a></h3>
								<span><a href="#">Illustrations</a>, <a href="#">Graphics</a></span>
							</div>
						</div>
						<div class="portfolio-item">
							<div class="portfolio-image">
								<a href="portfolio-single-video.html">
									<img src="/ui-elements/images/portfolio/4/7.jpg" alt="Backpack Contents">
								</a>
								<div class="bg-overlay">
									<div class="bg-overlay-content dark" data-hover-animate="fadeIn">
										<a href="https://www.youtube.com/watch?v=kuceVNBTJio" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350" data-lightbox="iframe"><i class="icon-line-play"></i></a>
										<a href="portfolio-single.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn"></div>
								</div>
							</div>
							<div class="portfolio-desc">
								<h3><a href="portfolio-single-video.html">Backpack Contents</a></h3>
								<span><a href="#">UI Elements</a>, <a href="#">Icons</a></span>
							</div>
						</div>
						<div class="portfolio-item">
							<div class="portfolio-image">
								<a href="portfolio-single.html">
									<img src="/ui-elements/images/portfolio/4/8.jpg" alt="Sunset Bulb Glow">
								</a>
								<div class="bg-overlay">
									<div class="bg-overlay-content dark" data-hover-animate="fadeIn">
										<a href="images/portfolio/full/8.jpg" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350" data-lightbox="image" title="Image"><i class="icon-line-plus"></i></a>
										<a href="portfolio-single.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn"></div>
								</div>
							</div>
							<div class="portfolio-desc">
								<h3><a href="portfolio-single.html">Sunset Bulb Glow</a></h3>
								<span><a href="#">Graphics</a></span>
							</div>
						</div>

					</div>

					<div class="fancy-title title-center title-border topmargin">
						<h3>Posts Carousel</h3>
					</div>

					<div id="oc-posts" class="owl-carousel posts-carousel carousel-widget posts-md" data-pagi="false" data-items-xs="1" data-items-sm="2" data-items-md="3" data-items-lg="4">

						<div class="oc-item">
							<div class="entry">
								<div class="entry-image">
									<a href="images/portfolio/full/17.jpg" data-lightbox="image"><img src="/ui-elements/images/blog/grid/17.jpg" alt="Standard Post with Image"></a>
								</div>
								<div class="entry-title title-xs nott">
									<h3><a href="blog-single.html">This is a Standard post with a Preview Image</a></h3>
								</div>
								<div class="entry-meta">
									<ul>
										<li><i class="icon-calendar3"></i> 10th Feb 2021</li>
										<li><a href="blog-single.html#comments"><i class="icon-comments"></i> 13</a></li>
										<li><a href="#"><i class="icon-camera-retro"></i></a></li>
									</ul>
								</div>
								<div class="entry-content">
									<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate, asperiores quod est tenetur in.</p>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="entry">
								<div class="entry-image">
									<iframe src="https://player.vimeo.com/video/87701971" width="500" height="281" allow="autoplay; fullscreen" allowfullscreen></iframe>
								</div>
								<div class="entry-title title-xs nott">
									<h3><a href="blog-single-full.html">This is a Standard post with a Vimeo Video</a></h3>
								</div>
								<div class="entry-meta">
									<ul>
										<li><i class="icon-calendar3"></i> 16th Feb 2021</li>
										<li><a href="blog-single-full.html#comments"><i class="icon-comments"></i> 19</a></li>
										<li><a href="#"><i class="icon-film"></i></a></li>
									</ul>
								</div>
								<div class="entry-content">
									<p>Asperiores, tenetur, blanditiis, quaerat odit ex exercitationem pariatur quibusdam veritatis quisquam!</p>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="entry">
								<div class="entry-image">
									<div class="fslider" data-arrows="false" data-lightbox="gallery">
										<div class="flexslider">
											<div class="slider-wrap">
												<div class="slide"><a href="images/portfolio/full/10.jpg" data-lightbox="gallery-item"><img src="/ui-elements/images/blog/grid/10.jpg" alt="Standard Post with Gallery"></a></div>
												<div class="slide"><a href="images/portfolio/full/20.jpg" data-lightbox="gallery-item"><img src="/ui-elements/images/blog/grid/20.jpg" alt="Standard Post with Gallery"></a></div>
												<div class="slide"><a href="images/portfolio/full/21.jpg" data-lightbox="gallery-item"><img src="/ui-elements/images/blog/grid/21.jpg" alt="Standard Post with Gallery"></a></div>
											</div>
										</div>
									</div>
								</div>
								<div class="entry-title title-xs nott">
									<h3><a href="blog-single-small.html">This is a Standard post with a Slider Gallery</a></h3>
								</div>
								<div class="entry-meta">
									<ul>
										<li><i class="icon-calendar3"></i> 24th Feb 2021</li>
										<li><a href="blog-single-small.html#comments"><i class="icon-comments"></i> 21</a></li>
										<li><a href="#"><i class="icon-picture"></i></a></li>
									</ul>
								</div>
								<div class="entry-content">
									<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ratione, voluptatem, dolorem animi nisi autem!</p>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="entry">
								<div class="entry-image clearfix">
									<iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/301161123&amp;auto_play=false&amp;hide_related=true&amp;visual=true"></iframe>
								</div>
								<div class="entry-title title-xs nott">
									<h3><a href="blog-single.html">This is an Embedded Audio Post</a></h3>
								</div>
								<div class="entry-meta">
									<ul>
										<li><i class="icon-calendar3"></i> 28th Apr 2021</li>
										<li><a href="blog-single.html#comments"><i class="icon-comments"></i> 16</a></li>
										<li><a href="#"><i class="icon-music2"></i></a></li>
									</ul>
								</div>
								<div class="entry-content">
									<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ratione, voluptatem, dolorem animi nisi!</p>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="entry">
								<div class="entry-image">
									<iframe width="560" height="315" src="https://www.youtube.com/embed/SZEflIVnhH8" allowfullscreen></iframe>
								</div>
								<div class="entry-title title-xs nott">
									<h3><a href="blog-single-full.html">This is a Standard post with a Youtube Video</a></h3>
								</div>
								<div class="entry-meta">
									<ul>
										<li><i class="icon-calendar3"></i> 30th Apr 2021</li>
										<li><a href="blog-single-full.html#comments"><i class="icon-comments"></i> 34</a></li>
										<li><a href="#"><i class="icon-film"></i></a></li>
									</ul>
								</div>
								<div class="entry-content">
									<p>Asperiores, tenetur, blanditiis, quaerat odit ex exercitationem pariatur quibusdam veritatis quisquam!</p>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="entry">
								<div class="entry-image">
									<a href="images/portfolio/full/1.jpg" data-lightbox="image"><img src="/ui-elements/images/blog/grid/1.jpg" alt="Standard Post with Image"></a>
								</div>
								<div class="entry-title title-xs nott">
									<h3><a href="blog-single.html">This is a Standard post with another Preview Image</a></h3>
								</div>
								<div class="entry-meta">
									<ul>
										<li><i class="icon-calendar3"></i> 5th May 2021</li>
										<li><a href="blog-single.html#comments"><i class="icon-comments"></i> 6</a></li>
										<li><a href="#"><i class="icon-camera-retro"></i></a></li>
									</ul>
								</div>
								<div class="entry-content">
									<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate, asperiores quod est tenetur in.</p>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="entry">
								<div class="entry-image clearfix">
									<iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/17521446&amp;auto_play=false&amp;hide_related=false&amp;visual=true"></iframe>
								</div>
								<div class="entry-title title-xs nott">
									<h3><a href="blog-single.html">This is another Embedded Audio Post</a></h3>
								</div>
								<div class="entry-meta">
									<ul>
										<li><i class="icon-calendar3"></i> 15th May 2021</li>
										<li><a href="blog-single.html#comments"><i class="icon-comments"></i> 2</a></li>
										<li><a href="#"><i class="icon-music2"></i></a></li>
									</ul>
								</div>
								<div class="entry-content">
									<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ratione, voluptatem, dolorem animi nisi autem!</p>
								</div>
							</div>
						</div>

					</div>


					<div class="clear"></div>

					<div class="fancy-title title-center title-border topmargin">
						<h3>Products Carousel</h3>
					</div>

					<div id="oc-products" class="owl-carousel products-carousel carousel-widget" data-pagi="false" data-items-xs="1" data-items-sm="2" data-items-md="3" data-items-lg="4">

						<div class="oc-item">
							<div class="product">
								<div class="product-image">
									<a href="#"><img src="/ui-elements/images/shop/dress/1.jpg" alt="Checked Short Dress"></a>
									<a href="#"><img src="/ui-elements/images/shop/dress/1-1.jpg" alt="Checked Short Dress"></a>
									<div class="sale-flash badge bg-success p-2">50% Off*</div>
									<div class="bg-overlay">
										<div class="bg-overlay-content align-items-end justify-content-between" data-hover-animate="fadeIn" data-hover-speed="400">
											<a href="#" class="btn btn-dark me-2"><i class="icon-shopping-basket"></i></a>
											<a href="include/ajax/shop-item.html" class="btn btn-dark" data-lightbox="ajax"><i class="icon-line-expand"></i></a>
										</div>
										<div class="bg-overlay-bg bg-transparent"></div>
									</div>
								</div>
								<div class="product-desc center">
									<div class="product-title"><h3><a href="#">Checked Short Dress</a></h3></div>
									<div class="product-price"><del>$24.99</del> <ins>$12.49</ins></div>
									<div class="product-rating">
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star-half-full"></i>
									</div>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="product">
								<div class="product-image">
									<a href="#"><img src="/ui-elements/images/shop/pants/1-1.jpg" alt="Slim Fit Chinos"></a>
									<a href="#"><img src="/ui-elements/images/shop/pants/1.jpg" alt="Slim Fit Chinos"></a>
									<div class="bg-overlay">
										<div class="bg-overlay-content align-items-end justify-content-between" data-hover-animate="fadeIn" data-hover-speed="400">
											<a href="#" class="btn btn-dark me-2"><i class="icon-shopping-basket"></i></a>
											<a href="include/ajax/shop-item.html" class="btn btn-dark" data-lightbox="ajax"><i class="icon-line-expand"></i></a>
										</div>
										<div class="bg-overlay-bg bg-transparent"></div>
									</div>
								</div>
								<div class="product-desc center">
									<div class="product-title"><h3><a href="#">Slim Fit Chinos</a></h3></div>
									<div class="product-price">$39.99</div>
									<div class="product-rating">
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star-half-full"></i>
										<i class="icon-star-empty"></i>
									</div>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="product">
								<div class="product-image">
									<a href="#"><img src="/ui-elements/images/shop/dress/2.jpg" alt="Light Blue Denim Dress"></a>
									<a href="#"><img src="/ui-elements/images/shop/dress/2-2.jpg" alt="Light Blue Denim Dress"></a>
									<div class="bg-overlay">
										<div class="bg-overlay-content align-items-end justify-content-between" data-hover-animate="fadeIn" data-hover-speed="400">
											<a href="#" class="btn btn-dark me-2"><i class="icon-shopping-basket"></i></a>
											<a href="include/ajax/shop-item.html" class="btn btn-dark" data-lightbox="ajax"><i class="icon-line-expand"></i></a>
										</div>
										<div class="bg-overlay-bg bg-transparent"></div>
									</div>
								</div>
								<div class="product-desc center">
									<div class="product-title"><h3><a href="#">Light Blue Denim Dress</a></h3></div>
									<div class="product-price">$19.95</div>
									<div class="product-rating">
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star-empty"></i>
									</div>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="product">
								<div class="product-image">
									<a href="#"><img src="/ui-elements/images/shop/sunglasses/1.jpg" alt="Unisex Sunglasses"></a>
									<a href="#"><img src="/ui-elements/images/shop/sunglasses/1-1.jpg" alt="Unisex Sunglasses"></a>
									<div class="sale-flash badge bg-success p-2">Sale!</div>
									<div class="bg-overlay">
										<div class="bg-overlay-content align-items-end justify-content-between" data-hover-animate="fadeIn" data-hover-speed="400">
											<a href="#" class="btn btn-dark me-2"><i class="icon-shopping-basket"></i></a>
											<a href="include/ajax/shop-item.html" class="btn btn-dark" data-lightbox="ajax"><i class="icon-line-expand"></i></a>
										</div>
										<div class="bg-overlay-bg bg-transparent"></div>
									</div>
								</div>
								<div class="product-desc center">
									<div class="product-title"><h3><a href="#">Unisex Sunglasses</a></h3></div>
									<div class="product-price"><del>$19.99</del> <ins>$11.99</ins></div>
									<div class="product-rating">
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star-empty"></i>
										<i class="icon-star-empty"></i>
									</div>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="product">
								<div class="product-image">
									<a href="#"><img src="/ui-elements/images/shop/tshirts/1.jpg" alt="Blue Round-Neck Tshirt"></a>
									<a href="#"><img src="/ui-elements/images/shop/tshirts/1-1.jpg" alt="Blue Round-Neck Tshirt"></a>
									<div class="bg-overlay">
										<div class="bg-overlay-content align-items-end justify-content-between" data-hover-animate="fadeIn" data-hover-speed="400">
											<a href="#" class="btn btn-dark me-2"><i class="icon-shopping-basket"></i></a>
											<a href="include/ajax/shop-item.html" class="btn btn-dark" data-lightbox="ajax"><i class="icon-line-expand"></i></a>
										</div>
										<div class="bg-overlay-bg bg-transparent"></div>
									</div>
								</div>
								<div class="product-desc center">
									<div class="product-title"><h3><a href="#">Blue Round-Neck Tshirt</a></h3></div>
									<div class="product-price">$9.99</div>
									<div class="product-rating">
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star-half-full"></i>
										<i class="icon-star-empty"></i>
									</div>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="product">
								<div class="product-image">
									<a href="#"><img src="/ui-elements/images/shop/watches/1.jpg" alt="Silver Chrome Watch"></a>
									<a href="#"><img src="/ui-elements/images/shop/watches/1-1.jpg" alt="Silver Chrome Watch"></a>
									<div class="bg-overlay">
										<div class="bg-overlay-content align-items-end justify-content-between" data-hover-animate="fadeIn" data-hover-speed="400">
											<a href="#" class="btn btn-dark me-2"><i class="icon-shopping-basket"></i></a>
											<a href="include/ajax/shop-item.html" class="btn btn-dark" data-lightbox="ajax"><i class="icon-line-expand"></i></a>
										</div>
										<div class="bg-overlay-bg bg-transparent"></div>
									</div>
								</div>
								<div class="product-desc center">
									<div class="product-title"><h3><a href="#">Silver Chrome Watch</a></h3></div>
									<div class="product-price">$129.99</div>
									<div class="product-rating">
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star3"></i>
										<i class="icon-star-half-full"></i>
									</div>
								</div>
							</div>
						</div>

					</div>


					<div class="clear"></div>

					<div class="fancy-title title-center title-border topmargin">
						<h3>Events Carousel</h3>
					</div>

					<div id="oc-events" class="owl-carousel events-carousel carousel-widget" data-pagi="false" data-items-md="1" data-items-lg="2" data-items-xl="2">

						<div class="oc-item">
							<div class="entry event mb-3">
								<div class="grid-inner row align-items-center g-0 p-4">
									<div class="col-md-5 mb-md-0">
										<a href="#" class="entry-image">
											<img src="/ui-elements/images/events/thumbs/1.jpg" alt="Inventore voluptates velit totam ipsa">
											<div class="entry-date">10<span>Apr</span></div>
										</a>
									</div>
									<div class="col-md-7 ps-md-4">
										<div class="entry-title title-xs">
											<h3><a href="#">Inventore voluptates velit totam ipsa</a></h3>
										</div>
										<div class="entry-meta">
											<ul>
												<li><a href="#"><i class="icon-time"></i> 11:00 - 19:00</a></li>
												<li><a href="#"><i class="icon-map-marker2"></i> Melbourne</a></li>
											</ul>
										</div>
										<div class="entry-content">
											<a href="#" class="btn btn-secondary btn-sm" disabled="disabled">Buy Tickets</a> <a href="#" class="btn btn-danger btn-sm">Read More</a>
										</div>
									</div>
								</div>
							</div>

							<div class="entry event mb-0">
								<div class="grid-inner row align-items-center g-0 p-4">
									<div class="col-md-5 mb-md-0">
										<a href="#" class="entry-image">
											<img src="/ui-elements/images/events/thumbs/2.jpg" alt="Nemo quaerat nam beatae iusto">
											<div class="entry-date">16<span>Apr</span></div>
										</a>
									</div>
									<div class="col-md-7 ps-md-4">
										<div class="entry-title title-xs">
											<h3><a href="#">Nemo quaerat nam beatae iusto</a></h3>
										</div>
										<div class="entry-meta">
											<ul>
												<li><a href="#"><i class="icon-time"></i> 11:00 - 19:00</a></li>
												<li><a href="#"><i class="icon-map-marker2"></i> Perth</a></li>
											</ul>
										</div>
										<div class="entry-content">
											<a href="#" class="btn btn-info btn-sm">RSVP</a> <a href="#" class="btn btn-danger btn-sm">Read More</a>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="entry event mb-3">
								<div class="grid-inner row align-items-center g-0 p-4">
									<div class="col-md-5 mb-md-0">
										<a href="#" class="entry-image">
											<img src="/ui-elements/images/events/thumbs/3.jpg" alt="Ducimus ipsam error fugiat harum">
											<div class="entry-date">3<span>May</span></div>
										</a>
									</div>
									<div class="col-md-7 ps-md-4">
										<div class="entry-title title-xs">
											<h3><a href="#">Ducimus ipsam error fugiat harum</a></h3>
										</div>
										<div class="entry-meta">
											<ul>
												<li><a href="#"><i class="icon-time"></i> 11:00 - 19:00</a></li>
												<li><a href="#"><i class="icon-map-marker2"></i> Melbourne</a></li>
											</ul>
										</div>
										<div class="entry-content">
											<a href="#" class="btn btn-secondary btn-sm">Buy Tickets</a> <a href="#" class="btn btn-danger btn-sm">Read More</a>
										</div>
									</div>
								</div>
							</div>

							<div class="entry event mb-0">
								<div class="grid-inner row align-items-center g-0 p-4">
									<div class="col-md-5 mb-md-0">
										<a href="#" class="entry-image">
											<img src="/ui-elements/images/events/thumbs/4.jpg" alt="Nisi officia adipisci molestiae aliquam">
											<div class="entry-date">16<span>Jun</span></div>
										</a>
									</div>
									<div class="col-md-7 ps-md-4">
										<div class="entry-title title-xs">
											<h3><a href="#">Nisi officia adipisci molestiae aliquam</a></h3>
										</div>
										<div class="entry-meta">
											<ul>
												<li><a href="#"><i class="icon-time"></i> 12:00 - 18:00</a></li>
												<li><a href="#"><i class="icon-map-marker2"></i> New York</a></li>
											</ul>
										</div>
										<div class="entry-content">
											<a href="#" class="btn btn-info btn-sm">RSVP</a> <a href="#" class="btn btn-danger btn-sm">Read More</a>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="entry event mb-3">
								<div class="grid-inner row align-items-center g-0 p-4">
									<div class="col-md-5 mb-md-0">
										<a href="#" class="entry-image">
											<img src="/ui-elements/images/events/thumbs/4.jpg" alt="Nisi officia adipisci molestiae aliquam">
											<div class="entry-date">16<span>Jun</span></div>
										</a>
									</div>
									<div class="col-md-7 ps-md-4">
										<div class="entry-title title-xs">
											<h3><a href="#">Nisi officia adipisci molestiae aliquam</a></h3>
										</div>
										<div class="entry-meta">
											<ul>
												<li><a href="#"><i class="icon-time"></i> 12:00 - 18:00</a></li>
												<li><a href="#"><i class="icon-map-marker2"></i> New York</a></li>
											</ul>
										</div>
										<div class="entry-content">
											<a href="#" class="btn btn-info btn-sm">RSVP</a> <a href="#" class="btn btn-danger btn-sm">Read More</a>
										</div>
									</div>
								</div>
							</div>

							<div class="entry event mb-0">
								<div class="grid-inner row align-items-center g-0 p-4">
									<div class="col-md-5 mb-md-0">
										<a href="#" class="entry-image">
											<img src="/ui-elements/images/events/thumbs/2.jpg" alt="Nemo quaerat nam beatae iusto">
											<div class="entry-date">16<span>Apr</span></div>
										</a>
									</div>
									<div class="col-md-7 ps-md-4">
										<div class="entry-title title-xs">
											<h3><a href="#">Nemo quaerat nam beatae iusto</a></h3>
										</div>
										<div class="entry-meta">
											<ul>
												<li><a href="#"><i class="icon-time"></i> 11:00 - 19:00</a></li>
												<li><a href="#"><i class="icon-map-marker2"></i> Perth</a></li>
											</ul>
										</div>
										<div class="entry-content">
											<a href="#" class="btn btn-info btn-sm">RSVP</a> <a href="#" class="btn btn-danger btn-sm">Read More</a>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="oc-item">
							<div class="entry event mb-3">
								<div class="grid-inner row align-items-center g-0 p-4">
									<div class="col-md-5 mb-md-0">
										<a href="#" class="entry-image">
											<img src="/ui-elements/images/events/thumbs/1.jpg" alt="Inventore voluptates velit totam ipsa">
											<div class="entry-date">10<span>Apr</span></div>
										</a>
									</div>
									<div class="col-md-7 ps-md-4">
										<div class="entry-title title-xs">
											<h3><a href="#">Inventore voluptates velit totam ipsa</a></h3>
										</div>
										<div class="entry-meta">
											<ul>
												<li><a href="#"><i class="icon-time"></i> 11:00 - 19:00</a></li>
												<li><a href="#"><i class="icon-map-marker2"></i> Melbourne</a></li>
											</ul>
										</div>
										<div class="entry-content">
											<a href="#" class="btn btn-secondary btn-sm" disabled="disabled">Buy Tickets</a> <a href="#" class="btn btn-danger btn-sm">Read More</a>
										</div>
									</div>
								</div>
							</div>

							<div class="entry event mb-0">
								<div class="grid-inner row align-items-center g-0 p-4">
									<div class="col-md-5 mb-md-0">
										<a href="#" class="entry-image">
											<img src="/ui-elements/images/events/thumbs/3.jpg" alt="Ducimus ipsam error fugiat harum">
											<div class="entry-date">3<span>May</span></div>
										</a>
									</div>
									<div class="col-md-7 ps-md-4">
										<div class="entry-title title-xs">
											<h3><a href="#">Ducimus ipsam error fugiat harum</a></h3>
										</div>
										<div class="entry-meta">
											<ul>
												<li><a href="#"><i class="icon-time"></i> 11:00 - 19:00</a></li>
												<li><a href="#"><i class="icon-map-marker2"></i> Melbourne</a></li>
											</ul>
										</div>
										<div class="entry-content">
											<a href="#" class="btn btn-secondary btn-sm">Buy Tickets</a> <a href="#" class="btn btn-danger btn-sm">Read More</a>
										</div>
									</div>
								</div>
							</div>
						</div>

					</div>

					<div class="fancy-title title-center title-border topmargin">
						<h3>Portfolio Carousel - Full Width</h3>
					</div>

				</div>

				<div id="related-portfolio" class="owl-carousel owl-carousel-full portfolio-carousel carousel-widget" data-margin="0" data-pagi="false" data-items-xs="1" data-items-sm="2" data-items-md="3" data-items-lg="4">

					<article class="portfolio-item pf-graphics pf-uielements">
						<div class="grid-inner">
							<div class="portfolio-image">
								<a href="#">
									<img src="/ui-elements/images/portfolio/4/3.jpg" alt="Mac Sunglasses">
								</a>
								<div class="bg-overlay">
									<div class="bg-overlay-content dark flex-column" data-hover-animate="fadeIn">
										<div class="portfolio-desc pt-0 center" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350">
											<h3><a href="portfolio-single-video.html">Mac Sunglasses</a></h3>
											<span><a href="#">Graphics</a>, <a href="#">UI Elements</a></span>
										</div>

										<div class="d-flex">
											<a href="https://vimeo.com/89396394" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350" data-lightbox="iframe"><i class="icon-line-play"></i></a>
											<a href="portfolio-single.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
										</div>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn"></div>
								</div>
							</div>
						</div>
					</article>

					<article class="portfolio-item pf-icons pf-illustrations">
						<div class="grid-inner">
							<div class="portfolio-image">
								<div class="fslider" data-arrows="false" data-speed="400" data-pause="4000">
									<div class="flexslider">
										<div class="slider-wrap">
											<div class="slide"><a href="portfolio-single-gallery.html"><img src="/ui-elements/images/portfolio/4/4.jpg" alt="Morning Dew"></a></div>
											<div class="slide"><a href="portfolio-single-gallery.html"><img src="/ui-elements/images/portfolio/4/4-1.jpg" alt="Morning Dew"></a></div>
										</div>
									</div>
								</div>
								<div class="bg-overlay" data-lightbox="gallery">
									<div class="bg-overlay-content dark flex-column" data-hover-animate="fadeIn">
										<div class="portfolio-desc pt-0 center" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350">
											<h3><a href="portfolio-single-gallery.html">Morning Dew</a></h3>
											<span><a href="#">Icons</a>, <a href="#">Illustrations</a></span>
										</div>

										<div class="d-flex">
											<a href="images/portfolio/full/4.jpg" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350" data-lightbox="gallery-item"><i class="icon-line-stack-2"></i></a>
											<a href="images/portfolio/full/4-1.jpg" class="d-none" data-lightbox="gallery-item"></a>
											<a href="portfolio-single.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
										</div>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn"></div>
								</div>
							</div>
						</div>
					</article>

					<article class="portfolio-item pf-uielements pf-media">
						<div class="grid-inner">
							<div class="portfolio-image">
								<a href="portfolio-single.html">
									<img src="/ui-elements/images/portfolio/4/5.jpg" alt="Console Activity">
								</a>
								<div class="bg-overlay">
									<div class="bg-overlay-content dark flex-column" data-hover-animate="fadeIn">
										<div class="portfolio-desc pt-0 center" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350">
											<h3><a href="portfolio-single.html">Console Activity</a></h3>
											<span><a href="#">UI Elements</a>, <a href="#">Media</a></span>
										</div>

										<div class="d-flex">
											<a href="images/portfolio/full/5.jpg" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350" data-lightbox="image" title="Image"><i class="icon-line-plus"></i></a>
											<a href="portfolio-single.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
										</div>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn"></div>
								</div>
							</div>
						</div>
					</article>

					<article class="portfolio-item pf-graphics pf-illustrations">
						<div class="grid-inner">
							<div class="portfolio-image">
								<div class="fslider" data-arrows="false">
									<div class="flexslider">
										<div class="slider-wrap">
											<div class="slide"><a href="portfolio-single-gallery.html"><img src="/ui-elements/images/portfolio/4/6.jpg" alt="Shake It"></a></div>
											<div class="slide"><a href="portfolio-single-gallery.html"><img src="/ui-elements/images/portfolio/4/6-1.jpg" alt="Shake It"></a></div>
											<div class="slide"><a href="portfolio-single-gallery.html"><img src="/ui-elements/images/portfolio/4/6-2.jpg" alt="Shake It"></a></div>
											<div class="slide"><a href="portfolio-single-gallery.html"><img src="/ui-elements/images/portfolio/4/6-3.jpg" alt="Shake It"></a></div>
										</div>
									</div>
								</div>
								<div class="bg-overlay" data-lightbox="gallery">
									<div class="bg-overlay-content dark flex-column" data-hover-animate="fadeIn">
										<div class="portfolio-desc pt-0 center" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350">
											<h3><a href="portfolio-single-gallery.html">Shake It!</a></h3>
											<span><a href="#">Illustrations</a>, <a href="#">Graphics</a></span>
										</div>

										<div class="d-flex">
											<a href="images/portfolio/full/6.jpg" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350" data-lightbox="gallery-item"><i class="icon-line-stack-2"></i></a>
											<a href="images/portfolio/full/6-1.jpg" class="d-none" data-lightbox="gallery-item"></a>
											<a href="images/portfolio/full/6-2.jpg" class="d-none" data-lightbox="gallery-item"></a>
											<a href="images/portfolio/full/6-3.jpg" class="d-none" data-lightbox="gallery-item"></a>
											<a href="portfolio-single-gallery.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
										</div>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn"></div>
								</div>
							</div>
						</div>
					</article>

					<article class="portfolio-item pf-uielements pf-icons">
						<div class="grid-inner">
							<div class="portfolio-image">
								<a href="portfolio-single-video.html">
									<img src="/ui-elements/images/portfolio/4/7.jpg" alt="Backpack Contents">
								</a>
								<div class="bg-overlay">
									<div class="bg-overlay-content dark flex-column" data-hover-animate="fadeIn">
										<div class="portfolio-desc pt-0 center" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350">
											<h3><a href="portfolio-single-video.html">Backpack Contents</a></h3>
											<span><a href="#">UI Elements</a>, <a href="#">Icons</a></span>
										</div>

										<div class="d-flex">
											<a href="https://www.youtube.com/watch?v=kuceVNBTJio" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350" data-lightbox="iframe"><i class="icon-line-play"></i></a>
											<a href="portfolio-single.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
										</div>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn"></div>
								</div>
							</div>
						</div>
					</article>

					<article class="portfolio-item pf-graphics">
						<div class="grid-inner">
							<div class="portfolio-image">
								<a href="portfolio-single.html">
									<img src="/ui-elements/images/portfolio/4/8.jpg" alt="Sunset Bulb Glow">
								</a>
								<div class="bg-overlay">
									<div class="bg-overlay-content dark flex-column" data-hover-animate="fadeIn">
										<div class="portfolio-desc pt-0 center" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350">
											<h3><a href="portfolio-single.html">Sunset Bulb Glow</a></h3>
											<span><a href="#">Graphics</a></span>
										</div>

										<div class="d-flex">
											<a href="images/portfolio/full/8.jpg" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350" data-lightbox="image" title="Image"><i class="icon-line-plus"></i></a>
											<a href="portfolio-single.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
										</div>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn"></div>
								</div>
							</div>
						</div>
					</article>

					<article class="portfolio-item pf-illustrations pf-icons">
						<div class="grid-inner">
							<div class="portfolio-image">
								<div class="fslider" data-arrows="false" data-speed="650" data-pause="3500" data-animation="fade">
									<div class="flexslider">
										<div class="slider-wrap">
											<div class="slide"><a href="portfolio-single-gallery.html"><img src="/ui-elements/images/portfolio/4/9.jpg" alt="Bridge Side"></a></div>
											<div class="slide"><a href="portfolio-single-gallery.html"><img src="/ui-elements/images/portfolio/4/9-1.jpg" alt="Bridge Side"></a></div>
											<div class="slide"><a href="portfolio-single-gallery.html"><img src="/ui-elements/images/portfolio/4/9-2.jpg" alt="Bridge Side"></a></div>
										</div>
									</div>
								</div>
								<div class="bg-overlay" data-lightbox="gallery">
									<div class="bg-overlay-content dark flex-column" data-hover-animate="fadeIn">
										<div class="portfolio-desc pt-0 center" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350">
											<h3><a href="portfolio-single.html">Bridge Side</a></h3>
											<span><a href="#">Illustrations</a>, <a href="#">Icons</a></span>
										</div>

										<div class="d-flex">
											<a href="images/portfolio/full/9.jpg" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350" data-lightbox="gallery-item"><i class="icon-line-stack-2"></i></a>
											<a href="images/portfolio/full/9-1.jpg" class="d-none" data-lightbox="gallery-item"></a>
											<a href="images/portfolio/full/9-2.jpg" class="d-none" data-lightbox="gallery-item"></a>
											<a href="portfolio-single-gallery.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
										</div>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn"></div>
								</div>
							</div>
						</div>
					</article>

					<article class="portfolio-item pf-graphics pf-media pf-uielements">
						<div class="grid-inner">
							<div class="portfolio-image">
								<a href="portfolio-single-video.html">
									<img src="/ui-elements/images/portfolio/4/10.jpg" alt="Study Table">
								</a>
								<div class="bg-overlay">
									<div class="bg-overlay-content dark flex-column" data-hover-animate="fadeIn">
										<div class="portfolio-desc pt-0 center" data-hover-animate="fadeInDownSmall" data-hover-animate-out="fadeOutUpSmall" data-hover-speed="350">
											<h3><a href="portfolio-single-video.html">Study Table</a></h3>
											<span><a href="#">Graphics</a>, <a href="#">Media</a></span>
										</div>

										<div class="d-flex">
											<a href="https://vimeo.com/91973305" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350" data-lightbox="iframe"><i class="icon-line-play"></i></a>
											<a href="portfolio-single.html" class="overlay-trigger-icon bg-light text-dark" data-hover-animate="fadeInUpSmall" data-hover-animate-out="fadeOutDownSmall" data-hover-speed="350"><i class="icon-line-ellipsis"></i></a>
										</div>
									</div>
									<div class="bg-overlay-bg dark" data-hover-animate="fadeIn"></div>
								</div>
							</div>
						</div>
					</article>

				</div><!-- .portfolio-carousel end -->

			</div>
    `
}
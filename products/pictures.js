import {mramor} from './img-objects/mramor.js';
import {granit} from './img-objects/granit.js';
import {komplex} from './img-objects/komplex.js';
import {cool_ofrml} from './img-objects/cool_ofrml.js';
const allData = [...mramor, ...granit, ...komplex, ...cool_ofrml]//, 
// Рендер карточек автомобилей из allData
export function renderCars(data, lazyLoadCallback) {
	const carsGrid = document.getElementById('carsGrid');
	if (!carsGrid) return;
	carsGrid.innerHTML = (data || []).map(item => `
		<div class="car-card" data-category="${item.category}">
			<div class="car-image">
				<img src="" data-src="${item.image}" alt="${item.alt}" class="lazy">
				<button class="zoom-btn" data-image="${item.image}" data-alt="${item.alt}" aria-label="Увеличить изображение">
					<i class="fas fa-search-plus"></i>
				</button>
				<div class="car-overlay">
					<button class="btn btn-primary buy-btn" data-alt="${item.title}">Заказать</button>
				</div>
			</div>
			<div class="car-info">
				<h3>${item.title}</h3>
				<p class="car-price">${item.price}</p>
			</div>
		</div>
	`).join('');

  // <div class="car-features">
				// 	<span><i class="fas fa-cog"></i> ${item.features.transmission}</span>
				// 	<span><i class="fas fa-gas-pump"></i> ${item.features.fuel}</span>
				// 	<span><i class="fas fa-road"></i> ${item.features.mileage}</span>
	// </div>
	// После рендера перевешиваем hover-события и запускаем lazyLoad для новых изображений
	attachCardHoverHandlers();
	attachZoomButtonHandlers();
	attachOrderButtonHandlers();
	if (lazyLoadCallback && typeof lazyLoadCallback === 'function') {
		lazyLoadCallback();
	}
}

// Навешиваем hover-эффекты на карточки (после рендера)
export function attachCardHoverHandlers() {
	const cards = document.querySelectorAll('.car-card');
	cards.forEach(card => {
		card.addEventListener('mouseenter', () => {
			card.classList.add('card-hover');
		});
		card.addEventListener('mouseleave', () => {
			card.classList.remove('card-hover');
		});
	});
}

// Инициализация фильтрации автомобилей
export function initCarFilters() {
	const filterButtons = document.querySelectorAll('.filter-btn');
	if (filterButtons && filterButtons.length) {
		filterButtons.forEach(button => {
			button.addEventListener('click', () => {
				filterButtons.forEach(btn => btn.classList.remove('active'));
				button.classList.add('active');
				const filter = button.getAttribute('data-filter');
				const cards = document.querySelectorAll('.car-card');
				cards.forEach(card => {
					const category = card.getAttribute('data-category');
					if (filter === 'all' || category === filter) {
						card.style.display = 'block';
						card.style.animation = 'fadeIn 0.5s ease-in-out';
					} else {
						card.style.display = 'none';
					}
				});
			});
		});
	}
}

// Инициализация рендера карточек при загрузке DOM
export function initCars(lazyLoadCallback) {
	document.addEventListener('DOMContentLoaded', () => {
		if (Array.isArray(allData)) {
			renderCars(allData, lazyLoadCallback);
			initCarFilters();
		}
	});
}

// Навешиваем обработчики на кнопки увеличения изображения
export function attachZoomButtonHandlers() {
	const zoomButtons = document.querySelectorAll('.zoom-btn');
	zoomButtons.forEach(button => {
		button.addEventListener('click', (e) => {
			e.stopPropagation();
			const imageSrc = button.getAttribute('data-image');
			const imageAlt = button.getAttribute('data-alt');
			// Импортируем функцию открытия модального окна с изображением из script.js
			if (window.openImageModal) {
				window.openImageModal(imageSrc, imageAlt);
			}
		});
	});
}

// Навешиваем обработчики на кнопки увеличения изображения
export function attachOrderButtonHandlers() {
	const buyButtons = document.querySelectorAll('.buy-btn');
	buyButtons.forEach(button => {
		button.addEventListener('click', (e) => {
			e.stopPropagation();
			const name = button.getAttribute('data-alt');
//			const name = document.querySelector('.car-info h3').textContent.trim()
			// Импортируем функцию открытия модального окна с изображением из script.js
			if (window.openOrderModal) {
				window.openOrderModal(name);
			}
		});
	});
}

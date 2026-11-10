import './style.css';
import { installDebug } from './debug';
import { runGallery } from './gallery';
import { Game } from './game';

const canvas = document.getElementById('game') as HTMLCanvasElement;
const frame = document.getElementById('frame') as HTMLElement;

if (new URLSearchParams(location.search).has('gallery')) {
  // Development page: look at the models on their own (see gallery.ts).
  runGallery(canvas, frame);
} else {
  const game = new Game(canvas, frame);
  installDebug(game);
}

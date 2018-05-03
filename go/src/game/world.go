package main

const (
	platform_width  = 400
	platform_height = 32
)

type (
	platform struct {
		x, y, width, height int
	}

	world struct {
		platforms     []*platform
		width, height int
	}
)

func newWorld(width, height int) *world {
	w := new(world)
	w.platforms = make([]*platform, 0)
	w.width, w.height = width, height
	return w
}

func (w *world) addPlatform(p *platform) {
	w.platforms = append(w.platforms, p)
}

func (w *world) addPlatforms(platforms ...*platform) {
	for _, p := range platforms {
		w.addPlatform(p)
	}
}

func (w *world) inPlatform(x, y float64) (bool, *platform) {
	for _, platform := range w.platforms {
		maxX := platform.x + platform.width
		if x >= float64(platform.x) && x <= float64(maxX) {
			maxY := platform.y + platform.height
			if y >= float64(platform.y) && y <= float64(maxY) {
				return true, platform
			}
		}
	}
	return false, nil
}

func populateWorld(w *world) {
	w.addPlatforms(
		&platform{0, w.height - 64, platform_width * 2, platform_height * 2},
		&platform{700, 800, platform_width, platform_height},
		&platform{1200, 700, platform_width, platform_height},
		&platform{1750, 600, platform_width, platform_height},
		&platform{2000, 450, platform_width, platform_height},
	)
}

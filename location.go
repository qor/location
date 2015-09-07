package location

import (
	"fmt"
	"os"
	"path"
	"strings"

	"github.com/qor/qor"
	"github.com/qor/qor/admin"
)

type Location struct {
	Address   string
	City      string
	Region    string
	Country   string
	Zip       string
	Latitude  float64
	Longitude float64
}

type locationWriter interface {
	GetLocation() *Location
}

func (location *Location) GetLocation() *Location {
	return location
}

var injected bool

func (Location) InjectQorAdmin(res *admin.Resource) {
	Admin := res.GetAdmin()

	if !injected {
		injected = true
		for _, gopath := range strings.Split(os.Getenv("GOPATH"), ":") {
			admin.RegisterViewPath(path.Join(gopath, "src/github.com/qor/location/views"))
		}
		Admin.RegisterFuncMap("replace_suffix", func(str, suffix, newSuffix string) string {
			return fmt.Sprint(strings.TrimSuffix(str, suffix), newSuffix)
		})
	}

	if res.GetMeta("Location") == nil {
		res.Meta(&admin.Meta{Name: "Location", Type: "location", Valuer: func(resource interface{}, ctx *qor.Context) interface{} {
			return resource.(locationWriter).GetLocation()
		}})
		res.IndexAttrs(append(res.IndexAttrs(), "-Location")...)
		res.ShowAttrs(append(res.ShowAttrs(), "-Location")...)
		res.EditAttrs(append(res.EditAttrs(), "-Address", "-City", "-Region", "-Country", "-Zip", "-Latitude", "-Longitude")...)
		res.NewAttrs(append(res.NewAttrs(), "-Address", "-City", "-Region", "-Country", "-Zip", "-Latitude", "-Longitude")...)
	}
}

# Qor Location

Make your struct support pick up location from google map in [Qor Admin](http://github.com/qor/qor)

# Usage

```go
import (
	"github.com/jinzhu/gorm"
	"github.com/qor/location"
)

type Store struct {
	gorm.Model
	Name string
	location.Location
}
```

# License

Released under the [MIT License](https://github.com/jinzhu/gorm/blob/master/License).

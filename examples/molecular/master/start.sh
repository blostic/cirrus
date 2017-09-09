#!/bin/bash

sudo service redis-server start & /bin/bash

cd MolecularDynamicsParameterStudy/
/node_modules/hyperflow/bin/hflow run mgr.json


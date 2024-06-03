import React from "react";
import Rouct from "rouct";
import {If, Renderer, ForEach} from "neutrine/lib/components";
import {Content} from "neutrine/lib/components";
import {Heading} from "neutrine/lib/components";
import {Icon} from "neutrine/lib/components";
import {Rule} from "neutrine/lib/components";
import {Placeholder} from "neutrine/lib/components";
import {Nav, NavItem} from "neutrine/lib/components";

import {ChromosomeTrack} from "common/src/tracks/Chromosome/index.js";
import {KaryotypeTrack} from "common/src/tracks/Karyotype/index.js";
import {FeaturesTrack} from "common/src/tracks/Features/index.js";
import {Loading} from "common/src/components/Loading/index.js";
import {GeneCard} from "../components/GeneCard/index.js";
import {filterFeaturesByChromosome} from "../utils/features.js";

//Import views
import {GalleryListView} from "./GalleryList.js";
import {GalleryDetailView} from "./GalleryDetail.js";

//Build derived state from props
let buildDerivedStateFromProps = function (props) {
    let chromosomeName = props.request.params.chromosome.replace("chr", ""); 
    let chromosomeIndex = props.chromosomesIndex[chromosomeName];
    let newState = {
        "ready": false,
        "error": false,
        "genes": filterFeaturesByChromosome(props.genes, chromosomeName),
        "images": [],
        "genesIndex": {},
        "chromosome": props.chromosomes[chromosomeIndex]
    };
    //Build genes index
    newState.genes.forEach(function (gene, index) {
        newState.genesIndex[gene.name] = index;
    });
    //Return the dereived state
    //console.log(newState);
    return newState;
};

//Export explore view
export class GalleryView extends React.Component {
    constructor(props) {
        super(props);
        //Initial state
        this.state = buildDerivedStateFromProps(props);
        //Bind methods
        this.handleChromosomeClick = this.handleChromosomeClick.bind(this);
        this.handleGeneClick = this.handleGeneClick.bind(this);
        this.handleGeneListTabClick = this.handleGeneListTabClick.bind(this);
        this.handleGeneDetailTabClick = this.handleGeneDetailTabClick.bind(this);
    }
    //Component did mount --> load images
    componentDidMount() {
        let self = this;
        let images = []; //Output images data
        let readCoverageImage = function (index) {
            //Check for no more images ot load --> update state
            if (index >= self.state.genes.length) {
                return self.setState({"ready": true, "images": images});
            }
            //Read this image from file
            let name = self.state.genes[index].name;
            return self.props.client.getCoverageThumbnail(name).then(function (data) {
                images.push(data); //Save image data
                return readCoverageImage(index + 1); //Next image
            });
        };
        //Read all coverages images
        return readCoverageImage(0);
        //return this.setState({"ready": true});
    }
    //Handle chromosome click --> open this chromosome
    handleChromosomeClick(name) {
        //let currentChromosome = this.props.chromosomes.filter(function (chromosome) {
        //    return chromosome.name === name;
        //});
        ////Update the state with the current chromosome
        //let newState = buildStateFromPropsAndChromosome(this.props, currentChromosome[0]);
        //return this.setState(newState);
        return Rouct.redirect("cnvreporter", `/dashboard/gallery/${name}`);
    }
    //Handle gene click --> display this gene
    handleGeneClick(name) {
        let chromosome = this.state.chromosome.name; //Get current chromosome
        let gene = encodeURIComponent(name); //Encode gene name
        return Rouct.redirect("cnvreporter", `/dashboard/gallery/${chromosome}?gene=${gene}`);
    }
    //Handle gene list tab click
    handleGeneListTabClick() {
        let chromosome = this.state.chromosome.name; //Get current chromosome
        return Rouct.redirect("cnvreporter", `/dashboard/gallery/${chromosome}`);
    }
    //Handle gene detail tab click
    handleGeneDetailTabClick() {
        if (this.state.genes.length === 0) {
            return null; //No genes available
        }
        let chromosome = this.state.chromosome.name; //Get current chromosome
        let gene = encodeURIComponent(this.state.genes[0].name); //Get first gene name
        return Rouct.redirect("cnvreporter", `/dashboard/gallery/${chromosome}?gene=${gene}`);
    }
    //Render explore view
    render() {
        let self = this;
        let thresholds = this.props.thresholds;
        let chromosome = this.state.chromosome; //Get current chromosome
        let currentGene = this.props.request.query.gene || null; //Get current gene
        let currentTab = typeof currentGene === "string" ? "detail" : "list"; //Get current tab
        //Return the gallery wrapper
        return (
            <Content size="fluid" className="siimple--pt-0">
                {/* Page title */}
                <Heading type="h1" className="siimple--mb-4">
                    <strong>{this.props.title}</strong>
                </Heading>
                {/* Karyotype */}
                <div className="siimple--bg-white siimple--p-3 siimple--mb-3" style={{"borderRadius":"16px"}}>
                    <Renderer render={function () {
                        return React.createElement(KaryotypeTrack, {
                            "currentChromosome": chromosome,
                            "chromosomes": self.props.chromosomes,
                            "cytobands": self.props.cytobands,
                            "regions": self.props.genes,
                            "onChromosomeClick": self.handleChromosomeClick
                        });
                    }} />
                </div>
                <Rule className="siimple--mb-3" />
                {/* Current chromosome and CNA regions */}
                <Heading type="h4" className="siimple--mt-4">Chromosome {chromosome.name}</Heading>
                <div className="siimple--bg-white siimple--p-3 siimple--mb-3" style={{"borderRadius":"16px"}}>
                    <Renderer render={function () {
                        return React.createElement(FeaturesTrack, {
                            "key": `${chromosome.name}:${thresholds.amplification}-${thresholds.deletion}`,
                            "start": chromosome.start,
                            "end": chromosome.end,
                            "features": self.props.regions.filter(function (region) {
                                return region.chromosome === chromosome.name;
                            }),
                            "featureHeight": 12,
                            "title": "Custom CNV Regions"
                        });
                    }} />
                    <Renderer render={function () {
                        return React.createElement(ChromosomeTrack, {
                            "key": chromosome.name,
                            "currentChromosome": chromosome,
                            "currentRegion": currentGene,
                            "cytobands": self.props.cytobands,
                            "regions": self.state.genes,
                            "onRegionClick": self.handleGeneClick
                        });
                    }} />
                </div>
                {/* Navigation tabs */}
                <Nav tabs className="siimple--mb-3">
                    <NavItem active={currentTab === "list"} onClick={this.handleGeneListTabClick}>
                        <strong>All genes</strong>
                    </NavItem>
                    <NavItem active={currentTab === "detail"} onClick={this.handleGeneDetailTabClick}>
                        <strong>Gene Detail</strong>
                    </NavItem>
                </Nav>
                {/* Check for no gene provided --> render gallery list instead */}
                <If condition={this.state.ready && typeof currentGene !== "string"} render={function () {
                    return React.createElement(GalleryListView, {
                        "request": self.props.request,
                        "genes": self.state.genes,
                        "images": self.state.images,
                        "onGeneClick": self.handleGeneClick,
                        "onGenePinnedChange": self.props.onGenePinnedChange
                    });
                }} />
                {/* Gene provided --> render gallery detail mode */}
                <If condition={this.state.ready && typeof currentGene === "string"} render={function () {
                    //This component will have a key with the current gene in order to
                    //reload the component when the gene changes in the url
                    return React.createElement(GalleryDetailView, {
                        "key": currentGene,
                        "request": self.props.request,
                        "client": self.props.client,
                        "genes": self.state.genes,
                        "genesIndex": self.state.genesIndex,
                        "images": self.state.images,
                        "onGenePinnedChange": self.props.onGenePinnedChange,
                        "onGeneStateChange": self.props.onGeneStateChange
                    });
                }} />
            </Content>
        );
    }
}

//Export view default props
GalleryView.defaultProps = {
    "title": "CNV Gallery",
    "client": null,
    "chromosomes": []
};


